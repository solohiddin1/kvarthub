import React from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Input, Space } from 'antd';

interface CustombtnProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Custombtn: React.FC<CustombtnProps> = ({ value, onChange }) => {

  return (
    <Space vertical className='w-full mt-3'>
      <Input.Password
        required
        value={value}
        onChange={onChange}
        placeholder="Parol" 
        className="ant-input custom-password-input duration-300! py-3! pl-6! w-full! rounded-[30px]! font-normal! text-[18px]! text-[#1C1C1C]! !placeholder:text-[#1C1C1C] bg-[#0000000D]! outline-none! border border-transparent!  hover:bg-[#4DB2700D]! hover:text-[#5C5C5C]! hover:!placeholder:text-[#5C5C5C] hover:border! hover:border-[#28A453]! !box-shadow:none"
        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
      />
    </Space>
  );
};

export default Custombtn;