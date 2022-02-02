import React, { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import DropDown from '../componets/DropDown'
import { Sidebar } from 'primereact/sidebar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toolbar } from 'primereact/toolbar'
import { TabPanel, TabView } from 'primereact/tabview'
import { Checkbox } from 'primereact//checkbox'

import { FileUpload } from 'primereact/fileupload'
import TextInput from '../componets/TextInput'
import { Carousel } from 'primereact/carousel'
import { Dialog } from 'primereact/dialog'
import { Image } from 'primereact/image'
import AddEdit from '../componets/AddEdit'
import { InputText } from 'primereact/inputtext'
import AddUsers from '../componets/AddUsers'

import { MultiSelect } from 'primereact/multiselect'
// import 'react-multiple-select-dropdown-lite/dist/index.css'

export const Users = () => {

  const [value, setvalue] = useState('')

  const handleOnchange = val => {
    setvalue(val)
  }

  const options = [
    { label: 'Option 1', value: 'option_1' },
    { label: 'Option 2', value: 'option_2' },
    { label: 'Option 3', value: 'option_3' },
    { label: 'Option 4', value: 'option_4' },
  ]


  const [showAddUserForm, setShowAddUserForm] = useState(false)

  let [data, setData] = useState([
    {
      'first name': 'Mark',
      'last name': ' Blue',
      actions: (
        <>
          <Button
            icon={'pi pi-check-square'}
            className="p-button-info p-button-rounded mr-2"
            tooltip="Click to Select"
          />
          <Button
            icon={'pi pi-trash'}
            className="p-button-danger p-button-rounded"
            tooltip="Click to Delete"
          />
        </>
      ),
    },
  ])


  const [selectedUsers, setSelectedUsers] = useState(null)

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Users</h5>
    </div>
  )

  return (
    <div className="card  p-align-stretch vertical-container">
      <div className="">
        <Toolbar
          className="mb-4"
          left={
            <div>
              <Button
                className="p-button-success mr-2"
                icon="pi pi-plus"
                label="Add User"
                onClick={e=> setShowAddUserForm(true)}
              />
            </div>
          }
          right={
            <div>
              <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" placeholder="Search..." />
              </span>
            </div>
          }
        ></Toolbar>
      </div>

      {/* add candidate */}
      <Dialog
        header="Add Users"
        visible={showAddUserForm}
        onHide={(e) => setShowAddUserForm(false)}
        style={{ width: '95%', height: '90%' }}
      >
        <div className="preview-values">
          <h4>Values</h4>
          {value}
        </div>




        <AddUsers buttonName="Add User" buttonIcon="pi pi-plus" />
      </Dialog>
      {/* end */}

      <DataTable
        scrollable={true}
        value={data}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        className="datatable-responsive"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
        emptyMessage="No users found."
        header={header}
        responsiveLayout="scroll"
        selection={selectedUsers}
        onSelectionChange={(e) => setSelectedUsers(e.value)}
      >
        <Column field="first name" header="First name" sortable></Column>
        <Column field="last name" header="Last name" sortable></Column>
        <Column field="actions" header="Actions"></Column>
      </DataTable>

    </div>
  )
}
