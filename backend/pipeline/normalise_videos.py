"""
TrackSure Video Normalisation Pipeline (Step 3)
Transcodes all input videos to constant frame rate (CFR) 30 FPS H.264 MP4
so that frame indices match perfectly between offline AI detection and UI playback.
"""

import json
import os
import subprocess
import cv2
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIDEOS_DIR = os.path.join(BASE_DIR, "public", "videos")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

VIDEO_MAPPINGS = [
    {
        "cam_id": "CAM-001",
        "cam_name": "Camera A - Junction North",
        "node_id": "RN-101",
        "raw_file": "Tracksure-Video1st.mp4",
        "cfr_file": "cam1_cfr.mp4",
    },
    {
        "cam_id": "CAM-002",
        "cam_name": "Camera B - Mid Arterial",
        "node_id": "RN-102",
        "raw_file": "Tracksure-Video2nd.mp4",
        "cfr_file": "cam2_cfr.mp4",
    },
    {
        "cam_id": "CAM-003",
        "cam_name": "Camera C - Commercial Ring",
        "node_id": "RN-103",
        "raw_file": "Tracksure-Video3rd.mp4",
        "cfr_file": "cam3_cfr.mp4",
    },
    {
        "cam_id": "CAM-004",
        "cam_name": "Camera D - Express Link",
        "node_id": "RN-104",
        "raw_file": "Tracksure-Video4th.mp4",
        "cfr_file": "cam4_cfr.mp4",
    },
]

def normalise_videos():
    print("=" * 60)
    print("TrackSure Video Normalisation (CFR 30 FPS, H.264 YUV420p)")
    print(f"FFmpeg binary: {FFMPEG_EXE}")
    print("=" * 60)

    metadata_report = []

    for item in VIDEO_MAPPINGS:
        raw_path = os.path.join(VIDEOS_DIR, item["raw_file"])
        cfr_path = os.path.join(VIDEOS_DIR, item["cfr_file"])

        if not os.path.exists(raw_path):
            print(f"ERROR: Raw video not found: {raw_path}")
            continue

        print(f"\nProcessing {item['cam_id']} ({item['raw_file']}) -> {item['cfr_file']}...")
        
        # Transcode using standard CFR settings
        # Keep original resolution, enforce 30 fps, cfr, yuv420p
        cmd = [
            FFMPEG_EXE,
            "-y",
            "-i", raw_path,
            "-r", "30",
            "-vsync", "cfr",
            "-c:v", "libx264",
            "-preset", "faster",
            "-crf", "21",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-an",
            cfr_path
        ]

        ret = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if ret.returncode != 0:
            print(f"Transcoding failed for {raw_path}:\n{ret.stderr}")
            continue

        # Inspect resulting CFR video
        cap = cv2.VideoCapture(cfr_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = total_frames / fps if fps > 0 else 0
        cap.release()

        file_size_mb = os.path.getsize(cfr_path) / (1024 * 1024)

        video_meta = {
            "camera_id": item["cam_id"],
            "camera_name": item["cam_name"],
            "node_id": item["node_id"],
            "raw_file": item["raw_file"],
            "cfr_file": item["cfr_file"],
            "cfr_path": f"/videos/{item['cfr_file']}",
            "fps": round(fps, 2),
            "width": width,
            "height": height,
            "resolution": f"{width}x{height}",
            "total_frames": total_frames,
            "duration_sec": round(duration_sec, 2),
            "size_mb": round(file_size_mb, 2),
            "codec": "h264_cfr"
        }
        metadata_report.append(video_meta)
        print(f"  -> SUCCESS: {width}x{height} @ {fps:.1f} FPS, {total_frames} frames ({duration_sec:.1f}s), {file_size_mb:.2f} MB")

    report_path = os.path.join(REPORTS_DIR, "normalised_videos.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(metadata_report, f, indent=2)
    print(f"\nMetadata report written to {report_path}")

    return metadata_report

if __name__ == "__main__":
    normalise_videos()
