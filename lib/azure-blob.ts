import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const CONTAINER_NAME = "product-images";

function getContainerClient(): ContainerClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not configured");
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

/**
 * Upload a file buffer to Azure Blob Storage.
 * Returns the public URL of the uploaded blob.
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const container = getContainerClient();

  // Ensure container exists with public read access for blob-level
  await container.createIfNotExists({ access: "blob" });

  const uniqueName = `${Date.now()}-${filename.replace(/\s+/g, "-")}`;
  const blockBlobClient = container.getBlockBlobClient(uniqueName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

/**
 * Delete a blob by its full URL.
 */
export async function deleteImage(blobUrl: string): Promise<void> {
  const container = getContainerClient();
  const url = new URL(blobUrl);
  // The blob name is the path after the container name
  const blobName = url.pathname.split(`/${CONTAINER_NAME}/`)[1];
  if (!blobName) return;
  const blockBlobClient = container.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}
