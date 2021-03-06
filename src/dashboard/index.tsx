/**
 * 这里采用多入口打包，分离App端与管理端，
 * 二者代码更纯粹，同时也方便前后台的可扩展性
 * 后台包含App端数据模型，数据编辑时，同步更改
 */
import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import reportWebVitals from "~/reportWebVitals";
import Layout from "~/components/Layout";
import Responsive from "~/components/Responsive";
import { Provider } from "react-redux";
import { store } from "~/redux/store";

ReactDOM.render(
  <Provider store={store}>
    <Layout>
      <Responsive />
    </Layout>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
