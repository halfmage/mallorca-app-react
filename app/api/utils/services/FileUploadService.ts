import { v2 as cloudinary } from 'cloudinary'

export default class FileUploadService {
  protected cloudinary = cloudinary

  constructor() {
    this.cloudinary = cloudinary
    this.cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
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

  public async upload(file: File) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadResult = await new Promise(
      (resolve) => {
        cloudinary.uploader
          .upload_stream(
            (error, uploadResult) => resolve(uploadResult)
          )
          .end(buffer)
      }
    )

    // @ts-expect-error: skip type for now
    return uploadResult?.secure_url || null
  }
}
