import * as React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { requestChangePassword } from '../../../config/request';

import toast, { Toaster } from 'react-hot-toast';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
};

function ModalChangePassword({ open, setOpen }) {
    const [formData, setFormData] = React.useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await requestChangePassword(formData);
            toast.success(res.message);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div>
            <Toaster />
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                        sx={{
                            mb: 3,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: '#1976d2',
                        }}
                    >
                        Đổi mật khẩu
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Mật khẩu hiện tại
                            </Typography>
                            <input
                                type="password"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                }}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Mật khẩu mới
                            </Typography>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                }}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Xác nhận mật khẩu mới
                            </Typography>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={handleClose} variant="outlined">
                                Hủy
                            </Button>
                            <Button type="submit" variant="contained">
                                Xác nhận
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}

export default ModalChangePassword;
