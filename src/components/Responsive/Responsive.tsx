/**
 * 包含模式设置、响应式编辑通信iframe、与样式编辑面板MiniDashboard
 *
 */

import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import usePostMessage from "~/hooks/usePostMessage";
import { Dispatch, RootState } from "~/redux/dashboardStore";
import MiniDashboard from "../MiniDashboard";

interface Props {}
const Responsive: React.FC<Props> = () => {
  /**
   * ----------
   * 定义编辑模式
   * ----------
   */
  const isEditing = useSelector(
    (state: RootState) => state.controller.isEditing
  );

  const appData = useSelector((state: RootState) => state.appData);

  const setIsEditing = useDispatch<Dispatch>().controller.setIsEditing;
  const updateAppData = useDispatch<Dispatch>().appData.updateAppData;
  const updateActivationItem = useDispatch<Dispatch>().activationItem
    .updateActivationItem;

  useEffect(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const ref = useRef(null);

  // 创建postmessage通信 usePostMessage收集数据 redux 更新数据
  const sendMessage = usePostMessage(({ tag, value }) => {
    switch (tag) {
      case "setIsEditing":
        setIsEditing(value);
        break;
      case "updateAppData":
        updateAppData(value);
        break;
      case "updateActivationItem":
        updateActivationItem(value);
        break;
      default:
        break;
    }
  });

  // 收发处理，子窗口onload时向子窗口发送信息, 通知当前正处于编辑模式下，
  const win: Window | null = ref.current
    ? (ref.current as any).contentWindow
    : null;
  useEffect(() => {
    if (win) {
      win.onload = () => {
        sendMessage({ tag: "setIsEditing", value: true }, win);
      };
    }
  }, [isEditing, sendMessage, setIsEditing, win]);

  // 切换编辑视图
  const setEditing = useCallback(() => {
    if (win) {
      sendMessage({ tag: "setIsEditing", value: true }, win);
    }
    setIsEditing(!isEditing);
  }, [isEditing, sendMessage, setIsEditing, win]);

  // 收发处理，编辑完数据后通过sendMessage向子窗口发送最新数据。
  useEffect(() => {
    sendMessage(
      {
        tag: "updateAppData",
        value: appData,
      },
      win
    );
  }, [sendMessage, win, appData]);

  return (
    <>
      <span>
        视图模式：{isEditing === true ? "设计模式" : "预览模式"}
        视图
      </span>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={setEditing}>
        {isEditing === true ? "预览模式" : "设计模式"}
      </button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button>保存</button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button
        onClick={() => {
          window.localStorage.clear();
          window.location.reload();
        }}
      >
        重置
      </button>
      <iframe
        ref={ref}
        title="wrapiframe"
        src="/?isEditing=true"
        style={{
          width: "1px",
          minWidth: "100%",
          minHeight: `${window.innerHeight}px`,
        }}
      />
      <MiniDashboard />
    </>
  );
};

export default Responsive;
