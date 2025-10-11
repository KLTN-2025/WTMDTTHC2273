import classNames from 'classnames/bind';
import styles from './ManagerUser.module.scss';
import { useState, useEffect } from 'react';
import { Table, Tag, Switch, message } from 'antd';
import { requestEditRoleUser, requestGetAllUser } from '../../../../config/request';

import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function ManagerUser() {
    const [users, setUsers] = useState([]);

    const fetchData = async () => {
        console.log('fecthUser');
        const res = await requestGetAllUser();
        console.log('res', res);
        setUsers(res.metadata.users);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleAdmin = async (checked, id) => {
        try {
            const data = {
                isAdmin: checked,
                id,
            };
            const res = await requestEditRoleUser(data);
            await fetchData();
            message.success(res.message);
        } catch (error) {
            message.error(error.message);
        }
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => dayjs(createdAt).format('DD/MM/YYYY'),
        },
        {
            title: 'Loại tài khoản',
            dataIndex: 'typeLogin',
            key: 'typeLogin',
            render: (type) => <Tag color={type === 'email' ? 'blue' : 'green'}>{type.toUpperCase()}</Tag>,
        },
        {
            title: 'Trạng thái',
            key: 'isActive',
            dataIndex: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'error' : 'success'}>{isActive ? 'Không hoạt động' : ' Hoạt động'}</Tag>
            ),
        },
        {
            title: 'Quyền quản trị',
            key: 'isAdmin',
            render: (_, record) => (
                <Switch
                    checked={record.isAdmin === true} // So sánh rõ ràng
                    onChange={(checked) => handleToggleAdmin(checked, record._id)}
                    checkedChildren="Quản trị viên"
                    unCheckedChildren="Người dùng"
                />
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Quản lý người dùng</h2>
            <Table columns={columns} dataSource={users} />
        </div>
    );
}

export default ManagerUser;
