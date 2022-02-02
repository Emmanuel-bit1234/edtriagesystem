import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { Image } from 'primereact/image'
import { MultiSelect } from 'primereact/multiselect'
import React, { useState } from 'react'
import DropDown from './DropDown'
import TextInput from './TextInput'

export default function AddUsers({
  buttonName = 'Save',
  buttonIcon = 'pi pi-save',
}) {



  const [selectedGroups, setSelectedGroups] = useState(null);



  var [groups, setGroup] = useState([
    { name: 'Australia', code: 1 },
    { name: 'Brazil', code: 2 },
    { name: 'China', code: 3 },
    { name: 'Egypt', code: 4 },
    { name: 'France', code: 5 },
    { name: 'Germany', code: 6 },
    { name: 'India', code: 7 },
    { name: 'Japan', code: 8 },
    { name: 'Spain', code: 9 },
    { name: 'United States', code: 10 }
  ])

  const [selectedDelimitation, setSelectedDelimitation] = useState(null);
  var [delimitation, setDelimitation] = useState([
    { name: 'Australia', code: 1 },
    { name: 'Brazil', code: 2 },
    { name: 'China', code: 3 },
    { name: 'Egypt', code: 4 },
    { name: 'France', code: 5 },
    { name: 'Germany', code: 6 },
    { name: 'India', code: 7 },
    { name: 'Japan', code: 8 },
    { name: 'Spain', code: 9 },
    { name: 'United States', code: 10 }
  ])

  const Header = ({ name = "Select Group" }) => (<div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    <h5 className="m-0">{name}</h5>
  </div>)

  return (
    <div className="grid">
      <div className="col-12 lg:col-12">
        <div className="grid">
          <div className="col-12  lg:col-4">
            <TextInput label="User Name" />
          </div>


          <div className="col-12 lg:col-4">
            <TextInput label="Password" />
          </div>

          <div className="col-12  lg:col-4">
            <TextInput label="Name" />
          </div>
          <div className="col-12  lg:col-4">
            <TextInput label="Surname" />
          </div>

          <div className="col-12  lg:col-4">
            <TextInput label="Contact Number" />
          </div>
          <div className="col-12  lg:col-4">
            <TextInput label="Email Address" />
          </div>

          <div className="col-12 lg:col-12">
            <MultiSelect  style={{ "width": "100%" }} value={selectedGroups} options={groups} onChange={(e) => setSelectedGroups(e.value)} optionLabel="name" placeholder="Select groups" filter className="multiselect-custom"
            display="chip"
            />
            {selectedGroups !== null && selectedGroups?.length > 0 ? <>
              <DataTable
                scrollable={true}
                value={selectedGroups}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} groups"
                emptyMessage="No groups found."
                header={<Header name='Selected Groups'></Header>}
                responsiveLayout="scroll"
              >
                <Column field="code" header="Id" sortable></Column>
                <Column field="name" header="Group" sortable></Column>

              </DataTable>
            </> : ""}
          </div>


          <div className="col-12 lg:col-12">
            <MultiSelect style={{ "width": "100%" }}  value={selectedDelimitation} options={delimitation} onChange={(e) => setSelectedDelimitation(e.value)} optionLabel="name"  placeholder="Select Delimitation" filter className="multiselect-custom"
         display="chip"
         />
            {selectedDelimitation !== null && selectedDelimitation?.length > 0 ? <>
              <DataTable
                scrollable={true}
                value={selectedDelimitation}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} delimitations"
                emptyMessage="No delimitations found."
                header={<Header name='Selected Delimitation'></Header>}
                responsiveLayout="scroll"
              >
                <Column field="code" header="Id" sortable></Column>
                <Column field="name" header="Delimitations" sortable></Column>

              </DataTable>
            </> : ""}
          </div>

          <div className="col-12  lg:col-12">
            <Button
              label={buttonName}
              icon={buttonIcon}
              className="mr-2  my-1 p-button-success"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
