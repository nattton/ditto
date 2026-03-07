use axum::{
    body::Body,
    extract::{Request, State},
    http::{HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

fn default_enabled() -> bool {
    true
}

fn default_tags() -> Vec<String> {
    Vec::new()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteConfig {
    pub id: String,
    pub method: String,
    pub path: String,
    pub status_code: u16,
    pub response_body: String,
    pub headers: HashMap<String, String>,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    #[serde(default = "default_tags")]
    pub tags: Vec<String>,
}

type RouteStore = Arc<RwLock<HashMap<String, RouteConfig>>>;

pub struct AppState {
    pub routes: RouteStore,
    pub shutdown_tx: Mutex<Option<tokio::sync::oneshot::Sender<()>>>,
}

#[derive(Clone)]
struct ServerState {
    routes: RouteStore,
}

async fn mock_handler(State(state): State<ServerState>, req: Request) -> Response {
    let method = req.method().as_str().to_uppercase();
    let path = req.uri().path().to_string();
    let routes = state.routes.read().await;

    let matched = routes
        .values()
        .find(|r| r.enabled && r.method.to_uppercase() == method && r.path == path)
        .cloned();

    match matched {
        Some(route) => {
            let status = StatusCode::from_u16(route.status_code).unwrap_or(StatusCode::OK);
            let mut builder = Response::builder().status(status);
            for (k, v) in &route.headers {
                if let (Ok(name), Ok(val)) = (HeaderName::from_str(k), HeaderValue::from_str(v)) {
                    builder = builder.header(name, val);
                }
            }
            builder
                .body(Body::from(route.response_body.clone()))
                .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
        }
        None => {
            let body = serde_json::json!({
                "error": format!("No mock route matched {} {}", method, path)
            });
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap()
        }
    }
}

#[tauri::command]
async fn get_routes(state: tauri::State<'_, AppState>) -> Result<Vec<RouteConfig>, String> {
    let routes = state.routes.read().await;
    Ok(routes.values().cloned().collect())
}

#[tauri::command]
async fn add_route(state: tauri::State<'_, AppState>, route: RouteConfig) -> Result<(), String> {
    let mut routes = state.routes.write().await;
    routes.insert(route.id.clone(), route);
    Ok(())
}

#[tauri::command]
async fn remove_route(state: tauri::State<'_, AppState>, id: String) -> Result<(), String> {
    let mut routes = state.routes.write().await;
    routes.remove(&id);
    Ok(())
}

#[tauri::command]
async fn start_server(state: tauri::State<'_, AppState>, port: u16) -> Result<(), String> {
    let mut guard = state.shutdown_tx.lock().await;
    if guard.is_some() {
        return Err("Server is already running".to_string());
    }
    let (tx, rx) = tokio::sync::oneshot::channel::<()>();
    *guard = Some(tx);
    drop(guard);

    let server_state = ServerState {
        routes: state.routes.clone(),
    };
    let app = Router::new()
        .fallback(mock_handler)
        .with_state(server_state);
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .map_err(|e| e.to_string())?;

    tokio::spawn(async move {
        axum::serve(listener, app)
            .with_graceful_shutdown(async {
                rx.await.ok();
            })
            .await
            .ok();
    });
    Ok(())
}

#[tauri::command]
fn get_local_ips() -> Vec<String> {
    use std::net::UdpSocket;
    let mut ips = vec!["127.0.0.1".to_string()];
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(addr) = socket.local_addr() {
                let ip = addr.ip().to_string();
                if ip != "127.0.0.1" {
                    ips.push(ip);
                }
            }
        }
    }
    ips
}

#[tauri::command]
async fn stop_server(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut guard = state.shutdown_tx.lock().await;
    if let Some(tx) = guard.take() {
        let _ = tx.send(());
        Ok(())
    } else {
        Err("Server is not running".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        routes: Arc::new(RwLock::new(HashMap::new())),
        shutdown_tx: Mutex::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_routes,
            add_route,
            remove_route,
            start_server,
            stop_server,
            get_local_ips,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
