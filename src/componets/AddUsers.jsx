import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { Image } from 'primereact/image'
import { MultiSelect } from 'primereact/multiselect'
import React, { useEffect, useState } from 'react'
import RegistrationCentreService from '../service/RegistrationCentreService'
import DropDown from './DropDown'
import TextInput from './TextInput'

import { OrderList } from 'primereact/orderlist';
export default function AddUsers({
  buttonName = 'Save',
  buttonIcon = 'pi pi-save',
}) {


  var [groups, setGroup] = useState([])
  const [selectedGroups, setSelecedGroups] = useState(null);


  const [selectedCentre, setSelectedCentre] = useState(null);
  var [centre, setCentre] = useState([])


  var registrationService = new RegistrationCentreService();

  useEffect(() => {
    registrationService.getRegistrationCentres().then(data => {
      console.log(data)
      setCentre(data)
    });

  }, [])






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

          <div className="col-12 lg:col-4">
            <MultiSelect style={{ "width": "100%" }} value={selectedGroups} options={groups} onChange={(e) => setSelecedGroups(e.value)} optionLabel="name" placeholder="Select groups" filter className="multiselect-custom"
              display="chip"
            />
          </div>


          <div className="col-12 lg:col-4">
            <MultiSelect style={{ "width": "100%" }} value={selectedCentre} options={centre} onChange={(e) => setSelectedCentre(e.value)} optionLabel="name" placeholder="Select Registration Centre" filter className="multiselect-custom"
              display="chip"
            />

            {
              selectedCentre != null && selectedCentre?.length > 0 ? <OrderList value={selectedCentre} header="List of Centres" listStyle={{ height: 'auto' }} dataKey="id"
                itemTemplate={item => item.name} ></OrderList> : ""
            }
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
