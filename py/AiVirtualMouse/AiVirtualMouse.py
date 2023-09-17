import cv2
import HandTrackingModule as htm
import autopy
import numpy as np
import time
import pyautogui

wCam, hCam = 1080, 720
frameR = 100
smoothening = 5

cap = cv2.VideoCapture(0)
cap.set(3, wCam)
cap.set(4, hCam)
pTime = 0
plocX, plocY = 0, 0
clocX, clocY = 0, 0

detector = htm.handDetector()
wScr, hScr = autopy.screen.size()

# 定义手指名称
finger_names = ["thumb", "index", "middle", "ring", "pinky"]

# 用于跟踪手指状态
finger_states = {
    "thumb": False,
    "index": False,
    "middle": False,
    "ring": False,
    "pinky": False
}

# 用于跟踪鼠标状态
mouse_states = dict(moving=False, clicking=False, double_clicking=False, clicking_time=0, double_clicking_time=0,
                    right_clicking=False, right_clicking_start_time=0, scrolling=False, scrolling_start_time=0)

# 定义单击和双击间隔（秒）
click_interval = 1  # 单击间隔
double_click_interval = 5  # 双击间隔
# 定义右键长按持续时间（秒）
right_click_duration = 2  # 调整此值以控制右键长按的持续时间
scroll_duration = 10  # 设置滚轮滚动的持续时间（秒）
pyautogui.scroll(3)  # 增加滚动的单位数值

# 定义右键点击的初始状态为False
right_clicking = False

while True:
    success, img = cap.read()
    img = detector.findHands(img)
    cv2.rectangle(img, (frameR, frameR), (wCam - frameR, hCam - frameR), (0, 255, 0), 2, cv2.FONT_HERSHEY_PLAIN)
    lmList = detector.findPosition(img, draw=False)

    if len(lmList) != 0:
        x1, y1 = lmList[4][1:]  # 拇指
        x2, y2 = lmList[8][1:]  # 食指
        x3, y3 = lmList[12][1:]  # 中指
        x4, y4 = lmList[16][1:]  # 无名指
        x5, y5 = lmList[20][1:]  # 小指

        fingers = detector.fingersUp()

        # 用于跟踪每个手指的状态
        for i, finger in enumerate(finger_names):
            finger_states[finger] = fingers[i]

        # 如果只有大拇指伸出，进入单击模式
        if finger_states["thumb"]:
            current_time = time.time()
            if not mouse_states["moving"]:
                if current_time - mouse_states["clicking_time"] >= click_interval:
                    autopy.mouse.click()
                    mouse_states["clicking_time"] = current_time
        else:
            mouse_states["moving"] = False

        # 如果检测到中指状态，触发双击操作
        if finger_states["middle"]:
            current_time = time.time()
            if not mouse_states["moving"]:
                if current_time - mouse_states["double_clicking_time"] >= double_click_interval:
                    autopy.mouse.click()
                    autopy.mouse.click()
                    mouse_states["double_clicking_time"] = current_time
        else:
            mouse_states["moving"] = False


        # 如果食指，进入移动模式
        if finger_states["index"]:
            x = max(x1, x2)  # 获取拇指和食指中最右侧的x坐标
            y = min(y1, y2)  # 获取拇指和食指中最顶部的y坐标

            # 坐标转换：将手指坐标从窗口坐标转换为桌面坐标
            x_scr = np.interp(x, (frameR, wCam - frameR), (0, wScr))
            y_scr = np.interp(y, (frameR, hCam - frameR), (0, hScr))

            # 平滑处理
            clocX = plocX + (x_scr - plocX) / smoothening
            clocY = plocY + (y_scr - plocY) / smoothening

            autopy.mouse.move(wScr - clocX, clocY)
            cv2.circle(img, (x, y), 15, (255, 0, 255), cv2.FILLED)
            plocX, plocY = clocX, clocY
            mouse_states["moving"] = True
        else:
            mouse_states["moving"] = False
        # 如果五根手指都伸出，长按鼠标
        if all(finger_states.values()):
            autopy.mouse.toggle(down=True)
        else:
            autopy.mouse.toggle(down=False)
        if not (finger_states["index"] or finger_states["middle"]):
            if finger_states["pinky"] and finger_states["thumb"]:
                current_time = time.time()
                if not mouse_states["scrolling"]:
                    pyautogui.scroll(1)  # 模拟向上滚动
        if not (finger_states["index"] or finger_states["thumb"]):
            if finger_states["middle"] and finger_states["pinky"]:
                current_time = time.time()
                if not mouse_states["scrolling"]:
                    pyautogui.scroll(-1)  # 模拟向下滚动
        if finger_states["pinky"] and not finger_states["index"] and not finger_states["middle"] and not finger_states[
            "thumb"]:
            # 执行操作，只有当小拇指伸出，而其他手指都没有伸出时
            # 处理小拇指的右键点击和移动
            if finger_states["pinky"]:
                current_time = time.time()
                if not right_clicking:
                    # 设置右键点击 autopy.mouse.toggle(down=False, button=autopy.mouse.Button.RIGHT)
                    autopy.mouse.click(autopy.mouse.Button.RIGHT)
                    right_clicking = True
                if len(lmList) > 20:
                    x_pinky, y_pinky = lmList[20][1:]
                    x_scr_pinky = np.interp(x_pinky, (frameR, wCam - frameR), (0, wScr))
                    y_scr_pinky = np.interp(y_pinky, (frameR, hCam - frameR), (0, hScr))

                    # 平滑处理
                    clocX_x = plocX + (x_scr_pinky - plocX) / smoothening
                    clocY_y = plocY + (y_scr_pinky - plocY) / smoothening

                    autopy.mouse.move(wScr - clocX_x, clocY_y)
                    mouse_states["moving"] = True
            else:
                right_clicking = False
                autopy.mouse.toggle(down=False, button=autopy.mouse.Button.RIGHT)

    cTime = time.time()
    fps = 1 / (cTime - pTime)
    pTime = cTime
    cv2.putText(img, f'fps:{int(fps)}', [15, 25], cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 255), 2)
    cv2.imshow("Image", img)
    cv2.waitKey(1)