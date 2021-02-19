import React, { useCallback, useEffect, useState } from "react";
import Controller from "./../Controller";
import s from "./Dashboard.module.less";
import { Menu, Button } from "antd";
import {
  FormatPainterOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
const { Item } = Menu;

interface Props {}

const Dashboard: React.FC<Props> = () => {
  // 菜单数据源
  const style =
    useSelector((state: RootState) => state.activationItem.style) || {};
  // 菜单类型
  const type =
    useSelector((state: RootState) => state.activationItem.type);

  // 模板ID
  const moduleId = useSelector(
    (state: RootState) => state.activationItem.moduleId
  );

  // 当前编辑路径
  const [stylePath, setStylePath] = useState("");

  // 面板开关
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = useCallback(() => {
    if (!moduleId) {
      return;
    }
    setCollapsed(!collapsed);
  }, [collapsed, moduleId]);

  // 设置当前编辑路径
  const onSelectStylePath = useCallback((e) => {
    setStylePath(e.key);
  }, []);

  // 更换模板时初始化选择
  useEffect(() => {
    setStylePath("basic");
  }, [moduleId]);

  return (
    <div
      className={s.root}
      style={collapsed ? { width: "0px", border: "0 solid #eee" } : {}}
    >
      <Button
        className={s.menuicon}
        type={collapsed ? "primary" : "dashed"}
        onClick={toggleCollapsed}
      >
        <SettingOutlined />
      </Button>
      <div className={s.dashboardwrap}>
        <div className={s.headtab}>
          <Menu
            onClick={() => {}}
            selectedKeys={["mail"]}
            mode="horizontal"
            className={s.contentmenu}
          >
            <Menu.Item key="mail" className={s.discfirstitem} disabled>
              {type}
            </Menu.Item>
            <Menu.Item key="mail" icon={<FormatPainterOutlined />}>
              样式风格
            </Menu.Item>
            <Menu.Item key="app" icon={<ToolOutlined />}>
              数据配置
            </Menu.Item>
          </Menu>
        </div>
        {/* style dashboard */}
        {
          <div className={s.dashboardstylewrap}>
            <div className={s.menu}>
              <Menu
                className={s.tab}
                selectedKeys={[stylePath]}
                mode="inline"
                inlineCollapsed={collapsed}
                onSelect={onSelectStylePath}
              >
                {Object.keys(style).map((key: string) => (
                  <Item key={key}>{key}</Item>
                ))}
              </Menu>
            </div>
            <div className={s.dashboard}>
              <Controller path={stylePath} />
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default Dashboard;
