const roleMap = {
  super_admin: ["*"],
  global_admin: ["*"],
  admin: ["*", "create", "read", "update", "delete"],
  app_admin: ["*", "create", "read", "update", "delete"],
  lead: ["create", "read", "update", "blog.create", "blog.read", "blog.update", "blog.publish"],
  editor: ["create", "read", "update", "blog.create", "blog.read", "blog.update"],
  viewer: ["read", "blog.read"],
  user: ["read", "blog.read"],
};

export default roleMap;
