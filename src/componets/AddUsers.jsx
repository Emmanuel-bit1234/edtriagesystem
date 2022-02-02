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

  const [selectedCentre, setSelectedCentre] = useState(null);
  var [centre, setCentre] = useState([
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

          <div className="col-12 lg:col-6">
            <MultiSelect style={{ "width": "100%" }} value={selectedGroups} options={groups} onChange={(e) => setSelectedGroups(e.value)} optionLabel="name" placeholder="Select groups" filter className="multiselect-custom"
              display="chip"
            />
          </div>


          <div className="col-12 lg:col-6">
            <MultiSelect style={{ "width": "100%" }} value={selectedCentre} options={centre} onChange={(e) => setSelectedCentre(e.value)} optionLabel="name" placeholder="Select Registration Centre" filter className="multiselect-custom"
              display="chip"
            />
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
