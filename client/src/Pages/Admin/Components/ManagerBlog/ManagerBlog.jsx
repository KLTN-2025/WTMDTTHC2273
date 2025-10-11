import classNames from 'classnames/bind';
import styles from './ManagerBlog.module.scss';
import { useEffect, useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import AddBlogs from './AddBlogs/AddBlogs';
import dayjs from 'dayjs';

import { requestDeleteBlog, requestGetBlogs } from '../../../../config/request';

import { message } from 'antd';

const cx = classNames.bind(styles);

function ManagerBlog() {
    const [type, setType] = useState(0);

    const [dataBlog, setDataBlog] = useState([]);

    const fetchData = async () => {
        const res = await requestGetBlogs();
        setDataBlog(res.metadata);
    };

    useEffect(() => {
        fetchData();
    }, [type]);

    function createData(id, name, image, date) {
        return { id, name, image, date };
    }

    const rows = dataBlog.map((item) => {
        return createData(item._id, item.title, item.image, item.createdAt);
    });

    const handleDeleteBlog = async (id) => {
        try {
            await requestDeleteBlog(id);
            message.success('xoá bài viết thành công');
            await fetchData();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <h4>Quản lý blog</h4>
                <button onClick={() => setType(type === 0 ? 1 : 0)} type="button" className="btn btn-primary">
                    {type === 0 ? 'Thêm bài viết' : 'Quay lại'}
                </button>
            </header>

            <main>
                {type === 0 ? (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="center">Tên bài viết</TableCell>
                                    <TableCell align="center">Ảnh </TableCell>
                                    <TableCell align="center">Ngày đăng</TableCell>
                                    <TableCell align="center">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {row.id}
                                        </TableCell>
                                        <TableCell align="center">{row.name}</TableCell>
                                        <TableCell align="center">
                                            <img style={{ width: '100px' }} src={row.image} />
                                        </TableCell>
                                        <TableCell align="center">{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                onClick={() => handleDeleteBlog(row.id)}
                                                color="error"
                                                variant="contained"
                                            >
                                                Xoá
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <AddBlogs setType={setType} />
                )}
            </main>
        </div>
    );
}

export default ManagerBlog;
