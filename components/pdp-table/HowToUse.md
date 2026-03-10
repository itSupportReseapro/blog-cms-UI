Install export deps (PDF + Excel)
*********************************
npm i xlsx jspdf jspdf-autotable




"use client";

import { PdpTable } from "@/components/pdp-table";
import { useEffect, useState } from "react";

import PdpIconSortAsc from "@/components/pdp-icons/PdpIconSortTripleLineAse";
import PdpIconSortDesc from "@/components/pdp-icons/PdpIconSortTripleLineDese";
import PdpIconSortNone from "@/components/pdp-icons/PdpIconUpArrowThin173";

import PdpIconFilter from "@/components/pdp-icons/PdpIconFilterClassicFill";
// If you have a different “filter applied” icon, use it; else reuse.
import PdpIconExport from "@/components/pdp-icons/PdpIconUpArrowThin173";
import PdpIconExcel from "@/components/pdp-icons/PdpIconExcelPageTextOutline323";
import PdpIconPdf from "@/components/pdp-icons/PdpIconPdfPageTextFill";

import PdpIconEdit from "@/components/pdp-icons/PdpIconPlusThick";
import PdpIconDelete from "@/components/pdp-icons/PdpIconTrashThick";

// any search icon you have (replace)
import PdpIconSearch from "@/components/pdp-icons/PdpIconTrashThick"; // if exists

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 6000); // demo loading
    return () => clearTimeout(t);
  }, []);

const columns = [
  { field: "name", label: "Name", type: "string" },
  { field: "email", label: "Email", type: "string" },
  { field: "phone", label: "Phone", type: "string" },
  { field: "role", label: "Role", type: "string" },
  { field: "department", label: "Department", type: "string" },
  { field: "city", label: "City", type: "string" },
  { field: "state", label: "State", type: "string" },
  { field: "country", label: "Country", type: "string" },
  { field: "salary", label: "Salary", type: "number" },
  { field: "experience", label: "Experience (yrs)", type: "number" },
  { field: "joiningDate", label: "Joining Date", type: "date" },
  { field: "lastLogin", label: "Last Login", type: "date" },
  { field: "projects", label: "Projects", type: "number" },
  { field: "isActive", label: "Status", type: "status" },
  { field: "createdAt", label: "Created", type: "date" },
];

  const data = [
{ id:1,name:"Amit Sharma",email:"amit.sharma@test.com",phone:"9876543210",role:"Manager",department:"Sales",city:"Delhi",state:"Delhi",country:"India",salary:85000,experience:8,joiningDate:"2019-03-14",lastLogin:"2026-03-04",projects:6,isActive:1,createdAt:"2019-03-14"},
{ id:2,name:"Rohit Singh",email:"rohit.singh@test.com",phone:"9823456721",role:"Developer",department:"Engineering",city:"Bangalore",state:"Karnataka",country:"India",salary:72000,experience:5,joiningDate:"2021-01-10",lastLogin:"2026-03-03",projects:4,isActive:1,createdAt:"2021-01-10"},
{ id:3,name:"Priya Verma",email:"priya.verma@test.com",phone:"9812345678",role:"Designer",department:"UI/UX",city:"Mumbai",state:"Maharashtra",country:"India",salary:65000,experience:4,joiningDate:"2022-05-22",lastLogin:"2026-03-03",projects:5,isActive:1,createdAt:"2022-05-22"},
{ id:4,name:"Neha Gupta",email:"neha.gupta@test.com",phone:"9887766554",role:"HR Manager",department:"HR",city:"Pune",state:"Maharashtra",country:"India",salary:78000,experience:7,joiningDate:"2018-09-12",lastLogin:"2026-03-01",projects:3,isActive:1,createdAt:"2018-09-12"},
{ id:5,name:"Vikas Kumar",email:"vikas.kumar@test.com",phone:"9898989898",role:"QA Engineer",department:"Testing",city:"Hyderabad",state:"Telangana",country:"India",salary:60000,experience:3,joiningDate:"2023-02-18",lastLogin:"2026-03-02",projects:2,isActive:1,createdAt:"2023-02-18"},
{ id:6,name:"Rahul Mehta",email:"rahul.mehta@test.com",phone:"9871234560",role:"Team Lead",department:"Engineering",city:"Ahmedabad",state:"Gujarat",country:"India",salary:90000,experience:9,joiningDate:"2017-06-09",lastLogin:"2026-03-02",projects:7,isActive:1,createdAt:"2017-06-09"},
{ id:7,name:"Anjali Nair",email:"anjali.nair@test.com",phone:"9897766554",role:"Business Analyst",department:"Operations",city:"Kochi",state:"Kerala",country:"India",salary:71000,experience:6,joiningDate:"2020-07-15",lastLogin:"2026-03-02",projects:5,isActive:1,createdAt:"2020-07-15"},
{ id:8,name:"Karan Malhotra",email:"karan.malhotra@test.com",phone:"9811122233",role:"Product Manager",department:"Product",city:"Gurgaon",state:"Haryana",country:"India",salary:105000,experience:10,joiningDate:"2016-04-19",lastLogin:"2026-03-01",projects:8,isActive:1,createdAt:"2016-04-19"},
{ id:9,name:"Sneha Iyer",email:"sneha.iyer@test.com",phone:"9883344556",role:"Developer",department:"Engineering",city:"Chennai",state:"Tamil Nadu",country:"India",salary:74000,experience:5,joiningDate:"2021-08-21",lastLogin:"2026-03-02",projects:4,isActive:1,createdAt:"2021-08-21"},
{ id:10,name:"Aditya Joshi",email:"aditya.joshi@test.com",phone:"9819912233",role:"DevOps Engineer",department:"Infrastructure",city:"Pune",state:"Maharashtra",country:"India",salary:88000,experience:7,joiningDate:"2019-11-05",lastLogin:"2026-03-04",projects:6,isActive:1,createdAt:"2019-11-05"},
{ id:11,name:"Pooja Shah",email:"pooja.shah@test.com",phone:"9877701234",role:"Marketing Lead",department:"Marketing",city:"Surat",state:"Gujarat",country:"India",salary:76000,experience:6,joiningDate:"2020-12-10",lastLogin:"2026-03-03",projects:5,isActive:1,createdAt:"2020-12-10"},
{ id:12,name:"Sanjay Patel",email:"sanjay.patel@test.com",phone:"9871209834",role:"Sales Executive",department:"Sales",city:"Vadodara",state:"Gujarat",country:"India",salary:54000,experience:4,joiningDate:"2022-03-18",lastLogin:"2026-03-02",projects:3,isActive:1,createdAt:"2022-03-18"},
{ id:13,name:"Arjun Reddy",email:"arjun.reddy@test.com",phone:"9888887777",role:"Backend Developer",department:"Engineering",city:"Hyderabad",state:"Telangana",country:"India",salary:83000,experience:6,joiningDate:"2020-06-09",lastLogin:"2026-03-02",projects:5,isActive:1,createdAt:"2020-06-09"},
{ id:14,name:"Kavita Mishra",email:"kavita.mishra@test.com",phone:"9811123344",role:"Content Writer",department:"Marketing",city:"Lucknow",state:"UP",country:"India",salary:50000,experience:3,joiningDate:"2023-01-12",lastLogin:"2026-03-01",projects:2,isActive:1,createdAt:"2023-01-12"},
{ id:15,name:"Rakesh Yadav",email:"rakesh.yadav@test.com",phone:"9876509876",role:"Support Engineer",department:"Support",city:"Jaipur",state:"Rajasthan",country:"India",salary:47000,experience:2,joiningDate:"2023-05-16",lastLogin:"2026-03-01",projects:1,isActive:1,createdAt:"2023-05-16"},
{ id:16,name:"Meera Kapoor",email:"meera.kapoor@test.com",phone:"9872223344",role:"UI Designer",department:"UI/UX",city:"Delhi",state:"Delhi",country:"India",salary:62000,experience:4,joiningDate:"2021-09-10",lastLogin:"2026-03-04",projects:4,isActive:1,createdAt:"2021-09-10"},
{ id:17,name:"Ravi Nair",email:"ravi.nair@test.com",phone:"9891234512",role:"Project Manager",department:"Operations",city:"Trivandrum",state:"Kerala",country:"India",salary:98000,experience:9,joiningDate:"2017-07-19",lastLogin:"2026-03-02",projects:7,isActive:1,createdAt:"2017-07-19"},
{ id:18,name:"Deepak Choudhary",email:"deepak.ch@test.com",phone:"9877654321",role:"Data Analyst",department:"Analytics",city:"Indore",state:"MP",country:"India",salary:72000,experience:5,joiningDate:"2021-11-23",lastLogin:"2026-03-03",projects:4,isActive:1,createdAt:"2021-11-23"},
{ id:19,name:"Shweta Agarwal",email:"shweta.agarwal@test.com",phone:"9812233445",role:"Finance Manager",department:"Finance",city:"Kolkata",state:"West Bengal",country:"India",salary:86000,experience:8,joiningDate:"2018-10-14",lastLogin:"2026-03-02",projects:6,isActive:1,createdAt:"2018-10-14"},
{ id:20,name:"Tarun Bansal",email:"tarun.bansal@test.com",phone:"9871112233",role:"Security Engineer",department:"IT",city:"Noida",state:"UP",country:"India",salary:77000,experience:6,joiningDate:"2020-04-09",lastLogin:"2026-03-02",projects:5,isActive:1,createdAt:"2020-04-09"}];

  return (
    <div style={{ padding: 24 }}>
      <PdpTable
  title="PDP Classic Table"
  columns={columns}
  data={data}
  selectable={false}

  showActions
  onEdit={(row) => console.log("edit", row)}
  onDelete={(row) => console.log("delete", row)}

  showStatusDot
  highlightStatusCells

  loading={isLoading}
  theme="light"

  exportMode="allFiltered"

  bodyHeight={520}

  sidebarMode="auto"
  sidebarColumnThreshold={12}
  sidebarRowThreshold={30}

  icons={{
    sortNone: <PdpIconSortNone />,
    sortAsc: <PdpIconSortAsc />,
    sortDesc: <PdpIconSortDesc />,
    filter: <PdpIconFilter />,
    filterActive: <PdpIconFilter />,

    export: <PdpIconExport />,
    excel: <PdpIconExcel />,
    pdf: <PdpIconPdf />,

    edit: <PdpIconEdit />,
    delete: <PdpIconDelete />,
    search: <PdpIconSearch />,
  }}
/>
        </div>
      );
    }