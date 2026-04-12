"use client";

import "./page.css";
import { useState } from "react";
import PdpButton from "@/assets/buttons/button";
import Image from "next/image";
import { UniversalTable } from "@/components/universal-table";

import PlusIcon from "@/assets/Images/icon/plus-icon.svg";
import DefaultAvatar from "@/assets/Images/icon/Profile-avatar.svg";

import AddUserForm from "@/components/AddUserForm/AddUserForm";
import UserDetailsModal from "@/assets/modals/UserDetailsModal/UserDetailsModal";
import { uploadCmsAsset } from "@/services/cms.service";

const tableActions = [
  {
    key: "details",
    label: "Details",
    condition: () => true
  },
  {
    key: "remove",
    label: "Remove",
    condition: () => true
  }
];

const initialUsers = [
  {
    id: "01",
    name: "Pratyush Sharma",
    email: "sarah@example.com",
    role: "Admin",
    lastActive: "1 week ago",
    avatar: null,
    status: "created"
  }
];

const roleClassMap = {
  admin: "role-badge role-badge-admin",
  editor: "role-badge role-badge-editor",
  user: "role-badge role-badge-user",
};

export default function UserRolePage() {

  const [users,setUsers]=useState(initialUsers);
  const [showAddUser,setShowAddUser]=useState(false);
  const [selectedUser,setSelectedUser]=useState(null);

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

  const userColumns=[

    { field:"id", label:"Sl. No." },

    {
      field:"name",
      label:"Name",
      sortable:true,
      render:(_, row)=>(
        <div className="user-cell">

          <Image
            src={row.avatar || DefaultAvatar}
            alt="avatar"
            width={32}
            height={32}
            className="user-avatar"
          />

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

  const handleAddUser=()=>{

    const newUser={
      id:String(users.length+1).padStart(2,"0"),
      ...formData,
      lastActive:"Just now",
      status:"created"
    };

    setUsers(prev=>[...prev,newUser]);

    setFormData({
      name:"",
      email:"",
      phone:"",
      gender:"",
      dob:"",
      role:"",
      password:"",
      avatar:null
    });

    setShowAddUser(false);

  };

  const handleTableAction=(action,row)=>{

    if(action==="details"){
      setSelectedUser(row);
    }

    if(action==="remove"){
      setUsers(prev=>prev.filter(u=>u.id!==row.id));
    }

  };

  if(showAddUser){

    return(

      <AddUserForm
        formData={formData}
        onChange={handleInputChange}
        onAvatarUpload={handleAvatarUpload}
        onSubmit={handleAddUser}
        onBack={()=>setShowAddUser(false)}
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

      </section>

  );

}