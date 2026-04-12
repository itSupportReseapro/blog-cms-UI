import { getSingle, postResource, putResource } from "./http";

export function getBlogById(id) {
  return getSingle(`/getBlogById/${id}`, "Failed to fetch blog");
}

export function createBlog(payload) {
  return postResource("/postBlog", payload, "Failed to create blog");
}

export function updateBlog(id, payload) {
  return putResource(`/putBlog/${id}`, payload, "Failed to update blog");
}
