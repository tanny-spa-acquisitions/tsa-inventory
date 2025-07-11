import multer from "multer";
import os from "os";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

export default upload;