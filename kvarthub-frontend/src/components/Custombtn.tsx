import React from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import {  Input, Space } from 'antd';

const Custombtn: React.FC = () => {

  return (
        <Space vertical className='w-full mt-[12px]'>
        <Input.Password required
            placeholder="Password" className="  custom-input  !py-[12px] !pl-[24px] !w-full !rounded-[30px] !font-normal !text-[18px] !placeholder:text-[#1C1C1C] !bg-[#0000000D] !outline-none border-[1px] !border-transparent !duration-300  hover:!bg-[#4DB2700D] hover:!placeholder:text-[#00000080] hover:!border-[1px] hover:!border-[#28A453]  !box-shadow:none !outline-none"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
        </Space>
  );
};

export default Custombtn;