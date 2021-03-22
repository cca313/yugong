import { InfoCircleOutlined } from "@ant-design/icons";
import { Col, Divider, Input, InputNumber, Row, Select, Tooltip } from "antd";
import React from "react";
import Background from "../Background";
import s from "./PageSetting.module.less";
const Option = Select.Option;

interface Props {}

const units = ["px", "rem", "vw", "vh"];

const Pagesetting: React.FC<Props> = () => {
  return (
    <>
      <Divider orientation="left">基本信息</Divider>
      <Row className={s.row}>
        <Col className={s.label} span={4}>
          页面名称：
        </Col>
        <Col span={19}>
          <Input placeholder="请输入页面名称" className={s.num} />
        </Col>
        <Col span={1} />
      </Row>
      <Row className={s.row}>
        <Col className={s.label} span={4}>
          背景设置：
        </Col>
        <Col span={19}>
          <div className={s.bg}>
            <Background onChange={(data) => console.log(data)} />
          </div>
        </Col>
        <Col span={1} />
      </Row>
      <Row gutter={4} className={s.row}>
        <Col className={s.label} span={4}>
          页面单位：
        </Col>
        <Col span={7}>
          <Select placeholder="请选择" className={s.select}>
            {units.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Col>
        <Col className={s.info} span={1}>
          <Tooltip title={<div>终端页面显示单位</div>}>
            <InfoCircleOutlined />
          </Tooltip>
        </Col>
        <Col className={s.label} span={4}>
          编辑单位：
        </Col>
        <Col span={7}>
          <Select placeholder="请选择" className={s.select}>
            {units.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Col>
        <Col className={s.info} span={1}>
          <Tooltip title={<div>编辑面板使用单位</div>}>
            <InfoCircleOutlined />
          </Tooltip>
        </Col>
      </Row>

      <Row gutter={4} className={s.row}>
        <Col className={s.label} span={4}>
          UI宽度：
        </Col>
        <Col span={7}>
          <InputNumber placeholder="px" className={s.num} />
        </Col>
        <Col className={s.info} span={1}>
          <Tooltip title={<div>终端页面显示单位</div>}>
            <InfoCircleOutlined />
          </Tooltip>
        </Col>
        <Col className={s.label} span={4}>
          基准字体：
        </Col>
        <Col span={7}>
          <InputNumber placeholder="px" className={s.num} />
        </Col>
        <Col className={s.info} span={1}>
          <Tooltip title={<div>编辑面板使用单位</div>}>
            <InfoCircleOutlined />
          </Tooltip>
        </Col>
      </Row>
      <Divider orientation="left">页面挂载</Divider>
      Api
      <Divider orientation="left">百度统计</Divider>
      <Row className={s.row}>
        <Col className={s.label} span={4}>
          统计Id：
        </Col>
        <Col span={20}>
          <Input
            placeholder="请在百度账号下创建站点，获取统计Id"
            className={s.num}
          />
        </Col>
      </Row>
    </>
  );
};

export default Pagesetting;
