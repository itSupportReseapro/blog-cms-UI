"use client";

import "./page.css";
import { useState, useEffect, useRef } from "react";
import PdpButton from "@/assets/buttons/button";
import Image from "next/image";
import { UniversalTable } from "@/components/universal-table";

import PlusIcon from "@/assets/Images/icon/plus-icon.svg";
import DefaultAvatar from "@/assets/Images/icon/Profile-avatar.svg";

import AddUserForm from "@/components/AddUserForm/AddUserForm";
import UserDetailsModal from "@/assets/modals/UserDetailsModal/UserDetailsModal";
import ConfirmModal from "@/assets/modals/ConfirmModal/ConfirmModal";
import { resolveUploadUrl, uploadCmsAsset } from "@/services/cms.service";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getCompanyUsers,
  assignUserToApp,
  updateUser,
  getRoles,
  updateUserAppRole,
} from "@/services/user.service";

const tableActions = [
  {
    key: "details",
    label: "Details",
    condition: () => true
  },
  {
    key: "assign",
    label: "Assign Role",
    condition: (row) => !row.assignedToApp
  },
  {
    key: "edit",
    label: "Edit",
    condition: (row) => row.assignedToApp !== false
  },
  {
    key: "remove",
    label: "Remove",
    condition: (row) => row.assignedToApp !== false
  }
];

// We will fetch users from API on mount
// Initial static state removed

const roleClassMap = {
  admin: "role-badge role-badge-admin",
  editor: "role-badge role-badge-editor",
  user: "role-badge role-badge-user",
  unassigned: "role-badge role-badge-unassigned",
};

export default function UserRolePage() {

  const [users,setUsers]=useState([]);
  const [loadingUsers, setLoadingUsers]=useState(true);
  const [roles, setRoles] = useState([]);
  const [showAddUser,setShowAddUser]=useState(false);
  const [showEditUser,setShowEditUser]=useState(false);
  const [selectedUser,setSelectedUser]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [addingUser,setAddingUser]=useState(false);
  const [savingUser,setSavingUser]=useState(false);
  const [assigningUser, setAssigningUser] = useState(null); // user being assigned a role

  // Guard against React Strict Mode effect double-invoke in development
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUsers();
      fetchRoles();
    }
  }, []);

  const fetchRoles = async () => {
    const res = await getRoles("app");
    if (res && !res.error) {
      const list = Array.isArray(res.data) ? res.data : [];
      setRoles(list);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      // Fetch both app-assigned users and all company users in parallel
      const [appRes, companyRes] = await Promise.all([
        getAllUsers(),
        getCompanyUsers(),
      ]);

      // --- Parse app-assigned users ---
      const appList = (() => {
        if (!appRes || appRes.error) return [];
        const raw = Array.isArray(appRes?.data) ? appRes.data
          : Array.isArray(appRes?.data?.users) ? appRes.data.users
          : Array.isArray(appRes?.data?.items) ? appRes.data.items
          : Array.isArray(appRes?.users) ? appRes.users
          : Array.isArray(appRes?.items) ? appRes.items
          : Array.isArray(appRes) ? appRes : [];
        return raw;
      })();

      // Build a set of user_ids already assigned to this app
      const appUserMap = new Map();
      appList.forEach((u) => {
        const profile = u.user ?? u;
        const uid = String(u.user_id || profile.user_id || u.id || "");
        if (uid) appUserMap.set(uid, u);
      });

      // --- Parse company users ---
      const companyList = (() => {
        if (!companyRes || companyRes.error) return [];
        const raw = Array.isArray(companyRes?.data) ? companyRes.data
          : Array.isArray(companyRes?.data?.users) ? companyRes.data.users
          : Array.isArray(companyRes?.data?.items) ? companyRes.data.items
          : Array.isArray(companyRes) ? companyRes : [];
        return raw;
      })();

      // Debug
      if (appList.length > 0) console.log("First app user:", appList[0]);
      if (companyList.length > 0) console.log("First company user:", companyList[0]);

      // --- Map app-assigned users (have role in this app) ---
      const mappedAppUsers = appList.map((u, index) => {
        const profile = u.user ?? u;
        const fName = profile.first_name || u.first_name || "";
        const lName = profile.last_name || u.last_name || "";
        const fullName = `${fName} ${lName}`.trim();
        const isEmailLike = (s) => s && (s.includes("@") || s.includes(".com"));
        const name = fullName
          || (!isEmailLike(profile.full_name) && profile.full_name)
          || profile.email || u.email || "Unknown User";
        const roleName = u.role_name || u.role || profile.role || "user";

        return {
          id: String(u.user_id || u.id || profile.user_id || index + 1),
          user_id: String(u.user_id || profile.user_id || u.id || index + 1),
          user_app_id: u.id || null,
          name,
          email: profile.email || u.email || "",
          phone: profile.mobile_number_primary || profile.phone_no || u.phone_no || u.phone || "",
          role: roleName,
          role_id: u.role_id || null,
          lastActive: u.updated_at || u.last_active || "-",
          avatar: resolveUploadUrl(profile.user_photo || u.avatar || ""),
          gender: profile.gender || u.gender || "",
          dob: profile.date_of_birth || u.dob || "",
          status: Number(u.is_active ?? 1) === 0 ? "inactive" : "active",
          assignedToApp: true,
        };
      });

      // --- Map company users NOT yet assigned to this app ---
      const mappedCompanyOnly = companyList
        .filter((cu) => {
          const uid = String(cu.user_id || cu.id || "");
          return uid && !appUserMap.has(uid);
        })
        .map((cu, index) => {
          const profile = cu.user ?? cu;
          const fName = profile.first_name || cu.first_name || "";
          const lName = profile.last_name || cu.last_name || "";
          const fullName = `${fName} ${lName}`.trim();
          const isEmailLike = (s) => s && (s.includes("@") || s.includes(".com"));
          const name = fullName
            || (!isEmailLike(profile.full_name) && profile.full_name)
            || profile.email || cu.email || "Unknown User";

          return {
            id: String(cu.user_id || cu.id || profile.user_id || `cu-${index}`),
            user_id: String(cu.user_id || profile.user_id || cu.id || `cu-${index}`),
            user_app_id: null,
            user_company_id: cu.id || cu.user_company_id || null,
            name,
            email: profile.email || cu.email || "",
            phone: profile.mobile_number_primary || profile.phone_no || cu.phone_no || cu.phone || "",
            role: "Unassigned",
            role_id: null,
            lastActive: cu.updated_at || "-",
            avatar: resolveUploadUrl(profile.user_photo || cu.avatar || ""),
            gender: profile.gender || cu.gender || "",
            dob: profile.date_of_birth || cu.dob || "",
            status: Number(cu.is_active ?? 1) === 0 ? "inactive" : "active",
            assignedToApp: false,
          };
        });

      setUsers([...mappedAppUsers, ...mappedCompanyOnly]);
    } catch (error) {
      console.error("Error fetching users:", error);
      window.addSnackbar?.("Error loading users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const [formData,setFormData]=useState({
    name:"",
    email:"",
    phone:"",
    gender:"",
    dob:"",
    role:"",
    password:"",
    avatar:null
  });

  const [editFormData,setEditFormData]=useState({
    name:"",
    email:"",
    phone:"",
    gender:"",
    dob:"",
    role:"",
    password:"",
    avatar:null
  });

  const userColumns=[

    {
      field:"name",
      label:"Name",
      sortable:true,
      render:(_, row)=>(
        <div className="user-cell">

          {row.avatar ? (
            <img
              src={resolveUploadUrl(row.avatar)}
              alt="avatar"
              width={32}
              height={32}
              className="user-avatar"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            <Image
              src={DefaultAvatar}
              alt="avatar"
              width={32}
              height={32}
              className="user-avatar"
            />
          )}

          <span>{row.name}</span>

        </div>
      )
    },

    {
      field:"email",
      label:"Email",
      sortable:true
    },

    {
      field:"role",
      label:"Role",
      sortable:true,
      render:(value)=>{
        const normalizedRole = String(value || "").toLowerCase();
        const roleClass = roleClassMap[normalizedRole] || "role-badge";
        return <span className={roleClass}>{value || "-"}</span>;
      }
    },

    {
      field:"lastActive",
      label:"Last Active",
      sortable:true
    }

  ];

  const tableActionsForRows = tableActions.map((action) => ({
    ...action,
    onClick: (row) => handleTableAction(action.key, row),
  }));

  const toolbarLeft = (
    <PdpButton
      variant="primary"
      icon={PlusIcon}
      iconPosition="left"
      onClick={() => setShowAddUser(true)}
    >
      Add User
    </PdpButton>
  );

  const handleInputChange=(e)=>{
    const {name,value}=e.target;

    setFormData(prev=>({
      ...prev,
      [name]:value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      window.addSnackbar?.("Uploading avatar...", "info");

      const { url } = await uploadCmsAsset(file);

      setFormData((prev) => ({
        ...prev,
        avatar: url,
      }));

      window.addSnackbar?.("Avatar uploaded successfully", "success");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      window.addSnackbar?.("Avatar upload failed", "error");
    }
  };

  const handleAddUser = async () => {
    try {
      setAddingUser(true);
      window.addSnackbar?.("Creating user...", "info");

      const nameParts = (formData.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Find role_id from selected role name
      const selectedRole = roles.find(
        (r) => r.role_name === formData.role || r.role_key === formData.role
      );

      const selectedRoleId = selectedRole?.id || selectedRole?.role_id || null;

      if (!selectedRoleId) {
        window.addSnackbar?.("Please select a valid role", "error");
        return;
      }

      const payload = {
        email: formData.email || "",
        phone_no: formData.phone || "",
        first_name: firstName,
        last_name: lastName,
        gender: formData.gender || "",
        dob: formData.dob || "",
        password: formData.password || "",
        role_id: selectedRoleId,
      };

      const res = await createUser(payload);

      if (res && !res.error) {
        // Re-fetch from server to keep table consistent with app assignments.
        await fetchUsers();

        setFormData({
          name: "",
          email: "",
          phone: "",
          gender: "",
          dob: "",
          role: "",
          password: "",
          avatar: null
        });

        setShowAddUser(false);
        window.addSnackbar?.("User created and assigned successfully", "success");
      } else {
        window.addSnackbar?.(res?.message || "Failed to create user", "error");
      }
    } catch (error) {
      console.error("Create user failed:", error);
      window.addSnackbar?.(error.message || "Failed to create user", "error");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;

    try {
      window.addSnackbar?.("Deleting user...", "info");
      const res = await deleteUser(confirmDelete.id);

      if (res && !res.error) {
        setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
        window.addSnackbar?.("User deleted successfully", "success");
      } else {
        window.addSnackbar?.(res?.message || "Failed to delete user", "error");
      }
    } catch (error) {
      console.error("Delete user failed:", error);
      window.addSnackbar?.(error.message || "Failed to delete user", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleTableAction=(action,row)=>{

    if(action==="details"){
      setSelectedUser(row);
    }

    if(action==="assign"){
      setAssigningUser(row);
    }

    if(action==="edit"){
      setSelectedUser(row);
      // Pre-fill edit form with mapped row data
      setEditFormData({
        name: row.name || "",
        email: row.email || "",
        phone: row.phone || row.phone_no || "",
        gender: row.gender || "",
        dob: row.dob || "",
        role: row.role || "",
        password: "",
        avatar: row.avatar || null,
      });
      setShowEditUser(true);
    }

    if(action==="remove"){
      setConfirmDelete(row);
    }

  };

  const handleAssignRole = async (roleId) => {
    if (!assigningUser || !roleId) return;
    try {
      window.addSnackbar?.("Assigning role...", "info");
      const res = await assignUserToApp(assigningUser.user_id, roleId);
      if (res && !res.error) {
        await fetchUsers();
        window.addSnackbar?.("User assigned to app successfully", "success");
      } else {
        window.addSnackbar?.(res?.message || "Failed to assign user", "error");
      }
    } catch (error) {
      console.error("Assign user failed:", error);
      window.addSnackbar?.(error.message || "Failed to assign user", "error");
    } finally {
      setAssigningUser(null);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      window.addSnackbar?.("Uploading avatar...", "info");
      const { url } = await uploadCmsAsset(file);
      setEditFormData(prev => ({ ...prev, avatar: url }));
      window.addSnackbar?.("Avatar uploaded", "success");
    } catch {
      window.addSnackbar?.("Avatar upload failed", "error");
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      setSavingUser(true);
      window.addSnackbar?.("Saving...", "info");

      const nameParts = (editFormData.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const profileHasChanges =
        (editFormData.name || "") !== (selectedUser.name || "") ||
        (editFormData.phone || "") !== (selectedUser.phone || "") ||
        (editFormData.gender || "") !== (selectedUser.gender || "") ||
        (editFormData.dob || "") !== (selectedUser.dob || "") ||
        (editFormData.avatar || "") !== (selectedUser.avatar || "");

      const roleHasChanges = (editFormData.role || "") !== (selectedUser.role || "");

      if (!profileHasChanges && !roleHasChanges) {
        setShowEditUser(false);
        setSelectedUser(null);
        window.addSnackbar?.("No changes to save", "info");
        return;
      }

      if (profileHasChanges) {
        const payload = {
          first_name: firstName,
          last_name: lastName,
          mobile_number_primary: editFormData.phone,
          gender: editFormData.gender,
          date_of_birth: editFormData.dob,
          user_photo: resolveUploadUrl(editFormData.avatar),
        };

        const profileRes = await updateUser(selectedUser.id, payload);
        if (!profileRes || profileRes.error) {
          window.addSnackbar?.(profileRes?.message || "Failed to update user profile", "error");
          return;
        }
      }

      if (roleHasChanges) {
        const selectedRole = roles.find(
          (r) => r.role_name === editFormData.role || r.role_key === editFormData.role
        );
        const nextRoleId = selectedRole?.id || selectedRole?.role_id || null;

        if (!nextRoleId) {
          window.addSnackbar?.("Unable to resolve selected role", "error");
          return;
        }

        if (!selectedUser.user_app_id) {
          window.addSnackbar?.("Role update failed: missing user-app mapping", "error");
          return;
        }

        const roleRes = await updateUserAppRole(selectedUser.user_app_id, nextRoleId);
        if (!roleRes || roleRes.error) {
          window.addSnackbar?.(roleRes?.message || "Failed to update role", "error");
          return;
        }
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                user_id: selectedUser.user_id || u.user_id,
                name: editFormData.name || u.name,
                phone: editFormData.phone || u.phone,
                gender: editFormData.gender || u.gender,
                dob: editFormData.dob || u.dob,
                role: editFormData.role || u.role,
                avatar: resolveUploadUrl(editFormData.avatar || u.avatar),
              }
            : u
        )
      );

      setShowEditUser(false);
      setSelectedUser(null);
      window.addSnackbar?.("User updated successfully", "success");
    } catch (error) {
      window.addSnackbar?.(error.message || "Failed to update user", "error");
    } finally {
      setSavingUser(false);
    }
  };

  if(showEditUser && selectedUser){
    return(
      <AddUserForm
        formData={editFormData}
        onChange={handleEditInputChange}
        onAvatarUpload={handleEditAvatarUpload}
        onSubmit={handleSaveUser}
        onBack={() => { setShowEditUser(false); setSelectedUser(null); }}
        mode="edit"
        loading={savingUser}
        roleOptions={roles}
      />
    );
  }

  if(showAddUser){

    return(

      <AddUserForm
        formData={formData}
        onChange={handleInputChange}
        onAvatarUpload={handleAvatarUpload}
        onSubmit={handleAddUser}
        onBack={()=>setShowAddUser(false)}
        loading={addingUser}
        roleOptions={roles}
      />

    );

  }

  return(

    <section className="cms-dashboard">

        <div className="main-card">

          <div className="table-wrapper">

            <UniversalTable
              variant="data"
              rows={users}
              isLoading={loadingUsers}
              columns={userColumns}
              toolbarLeft={toolbarLeft}
              searchPlaceholder="Search users by name, email, or role"
              actions={tableActionsForRows}
              rowKey="id"
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              breakpoint={768}
              enableFilters={true}
              showFilterButton={true}
              showActions={true}
              showFooter={true}
              exportFileBaseName="users-and-roles"
            />

          </div>

        </div>

        <UserDetailsModal
          user={selectedUser}
          onClose={()=>setSelectedUser(null)}
        />

        {confirmDelete && (
          <ConfirmModal
            title="Delete User"
            message={`Are you sure you want to delete "${confirmDelete.name || confirmDelete.email}"? This action cannot be undone.`}
            onConfirm={handleDeleteUser}
            onClose={() => setConfirmDelete(null)}
          />
        )}

        {assigningUser && (
          <div className="assign-role-overlay" onClick={() => setAssigningUser(null)}>
            <div className="assign-role-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Assign Role</h3>
              <p>Assign <strong>{assigningUser.name || assigningUser.email}</strong> to this app with a role:</p>
              <div className="assign-role-list">
                {roles.map((r) => (
                  <button
                    key={r.id || r.role_id}
                    className="assign-role-btn"
                    onClick={() => handleAssignRole(r.id || r.role_id)}
                  >
                    {r.role_name || r.role_key}
                  </button>
                ))}
              </div>
              <button className="assign-role-cancel" onClick={() => setAssigningUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </section>

  );

}
