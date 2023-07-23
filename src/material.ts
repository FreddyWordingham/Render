export class Material {
    texture!: GPUTexture;
    view!: GPUTextureView;
    sampler!: GPUSampler;

    async initialise(device: GPUDevice, url: string) {
        const response = await fetch(url);
        const blob: Blob = await response.blob();
        const imageBitmap: ImageBitmap = await createImageBitmap(blob);

        await this.loadImageBitmap(device, imageBitmap);

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "rgba8unorm",
            dimension: "2d",
            aspect: "all",
            baseMipLevel: 0,
            mipLevelCount: 1,
            baseArrayLayer: 0,
            arrayLayerCount: 1,
        };
        this.view = this.texture.createView(viewDescriptor);

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1,
        };
        this.sampler = device.createSampler(samplerDescriptor);
    }

    async loadImageBitmap(device: GPUDevice, imageBitmap: ImageBitmap) {
        const textureDescriptor: GPUTextureDescriptor = {
            size: { width: imageBitmap.width, height: imageBitmap.height },
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        };
        this.texture = device.createTexture(textureDescriptor);

        device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: this.texture }, textureDescriptor.size);
    }
}
