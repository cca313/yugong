import React, { useCallback, useEffect, useRef, useState } from 'react';
import Pic, { Option } from '@eightfeet/picker';
import s from './Picker.module.less';

interface Props {
    id?: Option["id"];
    parentId?: Option["parentId"];
    title?: Option["title"];
    wheels: Option["wheels"];
    keyMap?: Option["keyMap"];
    defaultValue?: Option["defaultValue"];
    style?: Option["style"];
    cancelBtnText?: string;
    confirmBtnText?: string;
    onConfirm?: Option["onConfirm"];
    onCancel?: Option["onCancel"];
    transitionEnd?: Option["transitionEnd"];
    onShow?: Option["onShow"];
    onHide?: Option["onHide"];
    onChange?: Option["onChange"];
    children?: React.ReactNode;
}

const Picker:React.FC<Props> = ({
    children,
    onConfirm,
    ...other
}) => {
    const triggerRef = useRef<HTMLDivElement>(null)
    // 创建初始化
    const PicRef = useRef<Pic>();

    const handleOnConfirm = useCallback(
        (data) => {
            if (onConfirm instanceof Function) {
                onConfirm(data)
            }
        },
        [onConfirm],
    )

    useEffect(() => {
        if(triggerRef.current && !PicRef.current) {
            PicRef.current = new Pic({
                ...other,
                onChange: handleOnConfirm,
                trigger: `#${s.trigger}`
            });
        }
    }, [handleOnConfirm, other])

    useEffect(() => {
        return () => {
            PicRef.current?.destroy();
        }
    }, []);

    return <div ref={triggerRef} id={s.trigger}>{children}</div>;
}

export default Picker