import { v2 as cloudinary } from 'cloudinary'

export const DEFAULT_IMAGE_SOURCE = 'https://res.cloudinary.com'

export default class FileUploadService {
    protected cloudinary = cloudinary

    constructor() {
        this.cloudinary = cloudinary
        this.cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })
    }

    public async uploadByUrl(url: string) {
        const uploadResult = await cloudinary.uploader
            .upload(url)
            .catch((error) => {
                console.log('error = ', error)
            })

        return uploadResult?.secure_url || null
    }
}
