import { Button } from 'primereact/button'
import { FileUpload } from 'primereact/fileupload'
import { Image } from 'primereact/image'
import React from 'react'
import DropDown from './DropDown'
import TextInput from './TextInput'

export default function AddEdit({
  buttonName = 'Save',
  buttonIcon = 'pi pi-save',
}) {
  return (
    <div className="grid">
      <div className="col-12 lg:col-12">
        <div className="grid">
          <div className="col-12  lg:col-4">
            <TextInput label="Registration No" />
          </div>

          <div className="col-12  lg:col-4">
            <DropDown label={'Status'} error={'invalid selection'} />
          </div>

          <div className="col-12 lg:col-4">
            <TextInput label="Status Reason" />
          </div>

          <div className="col-12  lg:col-4">
            <TextInput label="Ballot Name" />
          </div>
          <div className="col-12  lg:col-4">
            <TextInput label="Ballot Other Name" />
          </div>

          <div className="col-12  lg:col-4">
            <TextInput label="Surname" />
          </div>
          <div className="col-12  lg:col-4">
            <TextInput label="First Name" />
          </div>

          <div className="col-12  lg:col-4">
            <TextInput label="Date Of Birth" />
          </div>

          <div className="col-12 lg:col-4 card flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <FileUpload
              chooseLabel="Upload Image"
              name="demo"
              accept="image/*"
              maxFileSize={1000000}
              mode="basic"
              className="mr-2 my-1 p-button-info"
            />
          </div>

          <div className="col-12  lg:col-4">
            <DropDown label={'Gender'} error={'invalid selection'} />
          </div>

          <div className="col-12  lg:col-4">
            <TextInput label="Ballot  Order" />
          </div>8

          <div className="col-12 lg:col-4">
            <Image
              preview={true}
              src="https://www.primefaces.org/primereact/images/galleria/galleria11.jpg"
              template="Preview Logo"
              alt="Image Text"
              width="100px"
              style={{ width: '100px', objectFit: 'cover' }}
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
