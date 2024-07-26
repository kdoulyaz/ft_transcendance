import { extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

export const multerOptions = {
    limits: {
        fileSize: +process.env.MAX_FILE_SIZE
    },
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null, true);
        } else {
            cb(
                new HttpException(
                    `Unsupported file type ${extname(file.originalname)}`,
                    HttpStatus.BAD_REQUEST
                ),
                false
            );
        }
    },

    storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
            const uploadPath = './public/upload/';
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (req: any, file: any, cb: any) => {
            cb(null, `${uuid()}${extname(file.originalname)}`);
        }
    })
};
