"use client";

import "./page.css";
import { useState } from "react";
import Table from "@/assets/ui/tables/Table";
import StatusBadge from "@/assets/ui/tables/StatusBadge";
import { TableProvider } from "@/context/TableContext";
import PdpButton from "@/assets/buttons/button";
import Image from "next/image";

import PlusIcon from "@/assets/Images/icon/plus-icon.svg";
import SearchIcon from "@/assets/Images/icon/search-icon.svg";
import DownloadIcon from "@/assets/Images/icon/DownloadIcon.svg";
import FilterIcon from "@/assets/Images/icon/filter-icon.svg";
import BothArrowIcon from "@/assets/Images/icon/both-arrow.svg";
import DefaultAvatar from "@/assets/Images/icon/profile-avatar.svg";

import AddUserForm from "@/components/AddUserForm/AddUserForm";
import UserDetailsModal from "@/assets/ui/modals/UserDetailsModal";

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

export default function UserRolePage() {

  const [users,setUsers]=useState(initialUsers);
  const [showAddUser,setShowAddUser]=useState(false);
  const [selectedUser,setSelectedUser]=useState(null);
  const [search,setSearch]=useState("");

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

    {key:"id",label:"Sl. No."},

    {
      key:"name",
      label:(
        <div className="sortable-head">
          Name
          <Image src={BothArrowIcon} alt="sort" width={14} height={14}/>
        </div>
      ),
      sortable:true,
      render:(row)=>(
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
      key:"email",
      label:(
        <div className="sortable-head">
          Email
          <Image src={BothArrowIcon} alt="sort" width={14} height={14}/>
        </div>
      ),
      sortable:true
    },

    {
      key:"role",
      label:(
        <div className="sortable-head">
          Role
          <Image src={BothArrowIcon} alt="sort" width={14} height={14}/>
        </div>
      ),
      sortable:true,
      render:(row)=>(
        <StatusBadge status={row.role}/>
      )
    },

    {
      key:"lastActive",
      label:(
        <div className="sortable-head">
          Last Active
          <Image src={BothArrowIcon} alt="sort" width={14} height={14}/>
        </div>
      ),
      sortable:true
    }

  ];

  const handleInputChange=(e)=>{
    const {name,value}=e.target;

    setFormData(prev=>({
      ...prev,
      [name]:value
    }));
  };

  const handleAvatarUpload=(e)=>{

    const file=e.target.files?.[0];

    if(file){

      const url=URL.createObjectURL(file);

      setFormData(prev=>({
        ...prev,
        avatar:url
      }));

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

  const filteredUsers = users.filter(user=>{

    if(!search) return true;

    const term=search.toLowerCase();

    return(
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );

  });

  return(

    <TableProvider>

      <section className="cms-dashboard">

        <div className="main-card">

          <div className="top-controls">

            <PdpButton
              variant="primary"
              icon={PlusIcon}
              iconPosition="left"
              onClick={()=>setShowAddUser(true)}
            >
              Add User
            </PdpButton>

            <div className="right-controls">

              <div className="search-wrapper">

                <Image src={SearchIcon} alt="search" width={16} height={16}/>

                <input
                  className="search-input"
                  placeholder="Search"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                />

              </div>

              <button className="icon-btn">
                <Image src={DownloadIcon} alt="download" width={18} height={18}/>
              </button>

              <button className="icon-btn">
                <Image src={FilterIcon} alt="filter" width={18} height={18}/>
              </button>

            </div>

          </div>

          <Table
            data={filteredUsers}
            columns={userColumns}
            onActionExecute={handleTableAction}
          />

        </div>

        <UserDetailsModal
          user={selectedUser}
          onClose={()=>setSelectedUser(null)}
        />

      </section>

    </TableProvider>

  );

}