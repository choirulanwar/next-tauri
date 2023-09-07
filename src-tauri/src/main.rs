#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use std::sync::{Arc, RwLock};
use std::{thread, time};
use tauri::Window;

#[derive(Clone, serde::Serialize)]
struct Payload {
    progress: i16,
}

#[tauri::command]
async fn progress_tracker(window: Window) {
    let stop = Arc::new(RwLock::new(false));
    let stop_clone = Arc::clone(&stop);
    let handler = window.once("STOP", move |_| *stop_clone.write().unwrap() = true);

    let mut progress = 0;
    loop {
        if *stop.read().unwrap() {
            break;
        }

        window.emit("PROGRESS", Payload { progress }).unwrap();
        let delay = time::Duration::from_millis(100);
        thread::sleep(delay);
        progress += 1;
        if progress > 100 {
            break;
        }
    }
    window.unlisten(handler);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![progress_tracker])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
