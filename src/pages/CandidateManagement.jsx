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

export const CandidateManagement = () => {
  var [editPage, setEditPage] = useState(false)
  var [addCandidatePage, setAddCandidatePage] = useState(false)
  var [form, setForm] = useState({
    eventGroup: 'SELECT AN OPTION',
    eventType: 'SELECT AN OPTION',
    district: 'SELECT AN OPTION',
    constituency: 'SELECT AN OPTION',
    candidate: 'SELECT AN OPTION',
  })

  var getInput = (key, ev) => {
    setForm({ ...form, [key]: ev.value })
  }

  const eventGroupOptions = [
    { key: 'NAME1', name: 'NAME1', label: 'DESCRIPTION1' },
    { key: 'NAME2', name: 'NAME2', label: 'DESCRIPTION2' },
    { key: 'NAME3', name: 'NAME3', label: 'DESCRIPTION3' },
  ]

  let [data, setData] = useState([
    {
      'first name': 'Mark',
      'last name': ' Blue',
      gender: 'Male',
      active: 1,
      actions: (
        <>
          <Button
            icon={'pi pi-pencil'}
            className="p-button-info p-button-rounded mr-2"
            tooltip="Click to Edit"
            onClick={(e) => setEditPage(true)}
          />
          <Button
            icon={'pi pi-eye'}
            className="p-button-danger p-button-rounded"
            tooltip="Click to De-Activate"
          />
        </>
      ),
    },
  ])

  let proportionalData = [
    {
      'Political Party': 'Stephan Gouws',
      'Receipt No': 314,
      Name: 'Sandra',
      Surname: 'Nel',
      Status: 'Valid',
    },
  ]

  const [selectedProducts, setSelectedProducts] = useState(null)

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Candidate Management</h5>
    </div>
  )

  const proportionalListHeader = () => (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0"> Proportional List / Women Representatives</h5>
    </div>
  )

  const agentHeader = () => (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Agent</h5>
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
        <FileUpload
          name="demo"
          accept=".csv,.xlsx,.xls"
          maxFileSize={1000000}
          mode="basic"
          className="mr-2 my-1 p-button-info"
        />
        <Button
          label="Import"
          icon="pi pi-check"
          className="mr-2 my-1 p-button-info"
        />
        <Button
          label="Save"
          icon="pi pi-save"
          className="mr-2  my-1 p-button-success"
        />
      </div>
    </div>
  )
  return (
    <div className="card  p-align-stretch vertical-container">
      <div className="">
        <Toolbar
          className="mb-4"
          left={
            <div>
              <div className="grid  p-grid p-align-stretch vertical-container">
                <div className="col-12 lg:col-2">
                  <DropDown
                    label={'Event Group'}
                    options={eventGroupOptions}
                    value={form.eventGroup}
                    onChange={(e) => getInput('eventGroup', e)}
                    error={'invalid  selection'}
                  />
                </div>

                <div className="col-12 lg:col-2">
                  <DropDown
                    label={'Event Type'}
                    options={eventGroupOptions}
                    value={form.eventType}
                    onChange={(e) => getInput('eventType', e)}
                    error={'invalid  selection'}
                  />
                </div>
                <div className="col-12 lg:col-2">
                  <DropDown
                    label={'District'}
                    options={eventGroupOptions}
                    value={form.district}
                    onChange={(e) => getInput('district', e)}
                    error={'invalid  selection'}
                  />
                </div>

                <div className="col-12 lg:col-2">
                  <DropDown
                    label={'Constituency'}
                    options={eventGroupOptions}
                    value={form.constituency}
                    onChange={(e) => getInput('constituency', e)}
                    error={'invalid  selection'}
                  />
                </div>

                <div className="col-12 lg:col-2">
                  <DropDown
                    label={'Candidate Type'}
                    options={eventGroupOptions}
                    value={form.candidate}
                    onChange={(e) => getInput('candidate', e)}
                    error={'invalid  selection'}
                  />
                </div>
              </div>

              <Button
                className="p-button-success mr-2"
                icon="pi pi-plus"
                label="Add Candidate"
                onClick={(e) => setAddCandidatePage(true)}
              />
            </div>
          }
        ></Toolbar>
      </div>

      {/* add candidate */}
      <Dialog
        header="Add Candidate"
        visible={addCandidatePage}
        onHide={(e) => setAddCandidatePage(false)}
        style={{ width: '95%', height: '90%' }}
      >
        <AddEdit buttonName="Add Candidate" buttonIcon="pi pi-plus" />
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
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Candidates"
        emptyMessage="No candidates found."
        header={header}
        responsiveLayout="scroll"
        selection={selectedProducts}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
      >
        <Column field="first name" header="First name" sortable></Column>
        <Column field="last name" header="Last name" sortable></Column>
        <Column field="gender" header="Gender"></Column>
        <Column field="active" header="Active" sortable></Column>
        <Column field="actions" header="Actions"></Column>
      </DataTable>

      <div style={{ width: '550px' }} className="p-fluid">



        <Dialog
          header="Manage Candidate"
          visible={editPage}
          onHide={(e) => setEditPage(false)}
          style={{ width: '95%', height: '90%' }}
        >
          <TabView>
            <TabPanel header="Candidate Details">
              <AddEdit buttonName="Save" />
            </TabPanel>
            <TabPanel header="Proposer">
              <div className="grid">
                <div className="col-12 lg:col-6">
                  <div className="grid">
                    <div className="col-12 lg:col-12">
                      <TextInput label="Registration No"></TextInput>
                    </div>
                    <div className="col-12 lg:col-6">
                      <TextInput label="First Name"></TextInput>
                    </div>

                    <div className="col-12 lg:col-6">
                      <TextInput label="Last Name"></TextInput>
                    </div>
                    <div className="col-12">
                      <Checkbox
                        inputId="cb1"
                        value="New York"
                        checked={true}
                      ></Checkbox>
                      <label htmlFor="cb1" className="p-checkbox-label ml-2">
                        Seconder
                      </label>
                    </div>
                    <div className="col-12">
                      <Button
                        label="Save"
                        icon="pi pi-save"
                        className="p-button-success"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Agent">
              <DataTable
                value={proportionalData}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Proportional List"
                emptyMessage="No Proportional List / Women Representatives found."
                header={agentHeader}
                responsiveLayout="scroll"
                selection={selectedProducts}
              >
                <Column
                  field="Political Party"
                  header="Political Party"
                ></Column>
                <Column field="Receipt No" header="Receipt No"></Column>
                <Column field="Name" header="Name"></Column>
                <Column field="Surname" header="Surname"></Column>
                <Column field="Status" header="Status"></Column>
              </DataTable>
            </TabPanel>

            <TabPanel header="Proportional List">
              <DataTable
                value={proportionalData}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Proportional List"
                emptyMessage="No Proportional List / Women Representatives found."
                header={proportionalListHeader}
                responsiveLayout="scroll"
                selection={selectedProducts}
              >
                <Column
                  field="Political Party"
                  header="Political Party"
                ></Column>
                <Column field="Receipt No" header="Receipt No"></Column>
                <Column field="Name" header="Name"></Column>
                <Column field="Surname" header="Surname"></Column>
                <Column field="Status" header="Status"></Column>
              </DataTable>
            </TabPanel>
          </TabView>
        </Dialog>
      </div>
    </div>
  )
}
