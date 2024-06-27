import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleauth = async () => {
  // const { userId } = auth();
  // if (!userId) throw new Error("unauthorized");
  const user = await currentUser();

  if (!user) {
    throw new UploadThingError("unauthorized");
  }

  return {
    id: user.id,
  };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  logo: f({
    ["image/svg+xml"]: {
      maxFileSize: "1MB",
      maxFileCount: 1,
      additionalProperties: { height: 50, width: 50, aspectRatio: 1 },
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(() => handleauth())
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      //   console.log("Upload complete for userId:", metadata.userId);

      //   console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { urls: file.url };
    }),
  logoPNG: f({
    "image/png": {
      maxFileSize: "1MB",
      maxFileCount: 1,
      additionalProperties: { height: 50, width: 50, aspectRatio: 1 },
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(() => handleauth())
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      //   console.log("Upload complete for userId:", metadata.userId);

      //   console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { urls: file.url };
    }),
  logoWEBP: f({
    "image/webp": {
      maxFileSize: "1MB",
      maxFileCount: 1,
      additionalProperties: { height: 50, width: 50, aspectRatio: 1 },
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(() => handleauth())
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      //   console.log("Upload complete for userId:", metadata.userId);

      //   console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { urls: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
