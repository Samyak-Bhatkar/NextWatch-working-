import os
import cv2

BASE_DIR = r"c:\SAMYAKFILES\Users\AppData\Local\Programs\DATA SCIENCE COURSE\NexWatch\NexWatch"
VIDEOS_DIR = os.path.join(BASE_DIR, "public", "videos")
SNAPSHOTS_DIR = os.path.join(BASE_DIR, "public", "snapshots")
os.makedirs(SNAPSHOTS_DIR, exist_ok=True)

# 1. Camera A: Red Brezza SUV (MH31CB8061) at frame 190
cap1 = cv2.VideoCapture(os.path.join(VIDEOS_DIR, "cam1_cfr.mp4"))
cap1.set(cv2.CAP_PROP_POS_FRAMES, 190)
ret1, f1 = cap1.read()
if ret1:
    # Car crop: [330:930, 320:1080]
    car_crop1 = f1[380:920, 310:1050]
    # Resize to clean aspect ratio 320x240 for thumbnails
    thumb1 = cv2.resize(car_crop1, (320, 240), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "alert_cam1_mh31cb8061.jpg"), thumb1)
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "sample.jpg"), thumb1) # universal fallback
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "cam1_full.jpg"), f1)
    print("Saved alert_cam1_mh31cb8061.jpg and sample.jpg")
cap1.release()

# 2. Camera C: Commercial Van / Low-Trust Link (MH31CB8064) at frame 120
cap3 = cv2.VideoCapture(os.path.join(VIDEOS_DIR, "cam3_cfr.mp4"))
cap3.set(cv2.CAP_PROP_POS_FRAMES, 120)
ret3, f3 = cap3.read()
if ret3:
    # Crop commercial vehicle in middle/right lane
    h, w, _ = f3.shape
    crop3_van = f3[int(h*0.05):int(h*0.75), int(w*0.50):int(w*0.95)]
    thumb3_van = cv2.resize(crop3_van, (320, 240), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "alert_cam3_mh31cb8064.jpg"), thumb3_van)
    print("Saved alert_cam3_mh31cb8064.jpg")

    # Crop stopped vehicle (MH31EQ4892)
    crop3_stopped = f3[int(h*0.05):int(h*0.75), int(w*0.02):int(w*0.48)]
    thumb3_stopped = cv2.resize(crop3_stopped, (320, 240), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "alert_cam3_mh31eq4892.jpg"), thumb3_stopped)
    print("Saved alert_cam3_mh31eq4892.jpg")
cap3.release()

# 3. Camera B: Black BMW (FTT117) at frame 150
cap2 = cv2.VideoCapture(os.path.join(VIDEOS_DIR, "cam2_cfr.mp4"))
cap2.set(cv2.CAP_PROP_POS_FRAMES, 150)
ret2, f2 = cap2.read()
if ret2:
    # Black BMW crop
    h, w, _ = f2.shape
    crop2_bmw = f2[int(h*0.45):int(h*0.95), int(w*0.20):int(w*0.60)]
    thumb2 = cv2.resize(crop2_bmw, (320, 240), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "alert_cam2_ftt117.jpg"), thumb2)
    print("Saved alert_cam2_ftt117.jpg")
cap2.release()

# 4. Camera D: Astra Estate (AP05JEO) at frame 150
cap4 = cv2.VideoCapture(os.path.join(VIDEOS_DIR, "cam4_cfr.mp4"))
cap4.set(cv2.CAP_PROP_POS_FRAMES, 150)
ret4, f4 = cap4.read()
if ret4:
    h, w, _ = f4.shape
    crop4 = f4[int(h*0.50):int(h*0.85), int(w*0.50):int(w*0.72)]
    thumb4 = cv2.resize(crop4, (320, 240), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(SNAPSHOTS_DIR, "alert_cam4_ap05jeo.jpg"), thumb4)
    print("Saved alert_cam4_ap05jeo.jpg")
cap4.release()

print("All snapshots extracted successfully into public/snapshots/")
