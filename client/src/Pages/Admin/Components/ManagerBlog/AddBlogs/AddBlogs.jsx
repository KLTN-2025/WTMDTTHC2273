import classNames from 'classnames/bind';
import styles from './AddBlogs.module.scss';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextField from '@mui/material/TextField';
import { Editor } from '@tinymce/tinymce-react';
import { requestCreateBlog, requestUploadImage } from '../../../../../config/request';
import { useState } from 'react';

import toast, { Toaster } from 'react-hot-toast';

const cx = classNames.bind(styles);

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function AddBlogs({ setType }) {
    const [image, setImage] = useState('');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('images', file);
        formData.append('typeImages', 'blog');
        const res = await requestUploadImage(formData);
        setImage(res.metadata[0]);
    };

    const handleCreateBlog = async () => {
        try {
            const data = {
                title,
                content,
                image,
            };
            const res = await requestCreateBlog(data);
            toast.success(res.message);
            setType(0);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <Toaster />
            <div className={cx('inner')}>
                <div className={cx('left')}>
                    {!image ? (
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                        >
                            Chọn ảnh
                            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
                        </Button>
                    ) : (
                        <>
                            <img className={cx('image')} src={image} alt="" />
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                            >
                                Chọn ảnh
                                <VisuallyHiddenInput type="file" onChange={handleFileChange} />
                            </Button>
                        </>
                    )}

                    <TextField
                        id="outlined-basic"
                        label="Tên bài viết"
                        variant="outlined"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />
                    <div>
                        <Editor
                            apiKey="hfm046cu8943idr5fja0r5l2vzk9l8vkj5cp3hx2ka26l84x"
                            init={{
                                plugins:
                                    'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                toolbar:
                                    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            }}
                            initialValue="Nội dung bài viết"
                            onEditorChange={(e) => setContent(e)}
                        />
                    </div>
                </div>
                <div className={cx('right')}>
                    <p dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>

            <Button sx={{ mt: 2 }} fullWidth variant="contained" onClick={handleCreateBlog}>
                Tạo bài viết
            </Button>
        </div>
    );
}

export default AddBlogs;
