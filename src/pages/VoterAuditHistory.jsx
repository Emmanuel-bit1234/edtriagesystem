import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import React, { useRef, useState } from 'react'
import VoterAuditHistoryServices from '../service/VoterAuditHistoryServices'
import { TabPanel, TabView } from 'primereact/tabview'
import { Toolbar } from 'primereact/toolbar'
import { Toast } from 'primereact/toast'
import ObjectionsService from '../service/ObjectionsService'

export const VoterAuditHistory = () => {
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const toast = useRef(null)

  let [data, setData] = useState([])
  let [objection, setObjection] = useState([])
  var [selectedUser, setSelectedUser] = useState([])

  const [idNumber, setIdNumber] = useState('')
  var voterAuditHistory = new VoterAuditHistoryServices()

  const filters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  }

  const submitForm = () => {
    if (isNaN(idNumber.trim())) {
      toast.current.show({
        severity: 'error',
        summary: 'Error Message',
        detail: 'please fill the required field',
        life: 3000,
      })
      return false
    }
    setLoading(true)
    voterAuditHistory
      .getAuditHistoryByID(idNumber)
      .then((e) => {
        console.log(e)
        setData(e?.AHVoters ? e.AHVoters : [])
        setLoading(false)
      })
      .catch((e) => setLoading(false))
  }

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Voter Audit History</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        {/* <i className="pi pi-search" /> */}
        {/* <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Filter" /> */}
      </span>
    </div>
  )

  function VoterDetails() {


    var gender = JSON?.parse(localStorage.getItem('genders'))?.filter(
      (e) => e.id === selectedUser?.Gender,
    )[0]?.description

    return [
      {
        name: 'Firstname:',
        value: selectedUser?.Firstname,
      },
      {
        name: 'Surname:',
        value: selectedUser?.Surname,
      },
      {
        name: 'Gender:',
        value: gender,
      },
      {
        name: 'Date of birth:',
        value: selectedUser?.DayBirth,
      },
      {
        name: 'Address:',
        value: selectedUser?.Address,
      },
      {
        name: 'Email:',
        value: selectedUser?.Email_address,
      },
      {
        name: 'Contact Number:',
        value: selectedUser?.Contact_Number,
      },
    ]
  }

  function RegistrationDetails() {
    return [
      {
        name: 'ID Number:',
        value: selectedUser?.IDNumber,
      },
      {
        name: 'Registration Number:',
        value: selectedUser?.RegistrationNumber,
      },
      {
        name: 'Date of Issue:',
        value: selectedUser?.DateOfIssue,
      },
      {
        name: 'Date of Expiry:',
        value: selectedUser?.DateOfExpiry,
      },
      {
        name: 'Date Registered',
        value: selectedUser?.DateRegistered,
      },
      {
        name: 'Place of Issue',
        value: selectedUser?.PlaceOfIssue,
      },
    ]
  }

  return (
    <div className="grid">
      <div className="col-12">
        <Toast ref={toast} />
        <div>
          <Toolbar
            className="mb-4"
            left={
              <div>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    type="search"
                    placeholder="Search by ID Number"
                    value={idNumber}
                    onInput={(e) => setIdNumber(e.target.value)}
                  />
                  <Button
                    className="p-button-success ml-4"
                    label="Search"
                    onClick={submitForm}
                  />
                </span>
              </div>
            }
          ></Toolbar>
        </div>
        <div
          className="card  p-align-stretch vertical-container"
          style={{ height: 'calc(100vh - 9rem)' }}
        >
          <Dialog
            header="Voter Audit History"
            visible={showDialog}
            style={{ width: '50%', height: '100vh' }}
            modal
            onHide={(e) => {
              setShowDialog(false)
            }}
          >
            <TabView>
              <TabPanel header="Voters Details">
                <DataTable
                  size="small"
                  scrollable={true}
                  value={VoterDetails()}
                  dataKey="id"
                  responsiveLayout="scroll"
                  resizableColumns
                >
                  <Column
                    style={{ width: '100px' }}
                    field="name"
                    body={(e) => <b>{e.name}</b>}
                  ></Column>
                  <Column field="value"></Column>
                </DataTable>
              </TabPanel>
              <TabPanel header="Images">No Content</TabPanel>
              <TabPanel header="Registration Details">
                <DataTable
                  size="small"
                  scrollable={true}
                  value={RegistrationDetails()}
                  dataKey="id"
                  responsiveLayout="scroll"
                  resizableColumns
                >
                  <Column
                    style={{ width: '100px' }}
                    field="name"
                    body={(e) => <b>{e.name}</b>}
                  ></Column>
                  <Column field="value"></Column>
                </DataTable>
              </TabPanel>
              <TabPanel header="Anomalies">No Content</TabPanel>
              <TabPanel header="Objections">
                <DataTable
                  size="small"
                  scrollable={true}
                  value={objection}
                  dataKey="id"
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  className="datatable-responsive"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Objections"
                  emptyMessage="No Objections."
                  responsiveLayout="scroll"
                  resizableColumns
                  columnResizeMode="expand"
                  filterDisplay="menu"
                >
                  <Column
                    filterField="Name"
                    field="Name"
                    header="Name"
                    sortable
                  ></Column>
                  <Column  header="RegistrationNumber" body={ selectedUser?.RegistrationNumber}></Column>
                  <Column field="DateLodged" header="DateLodged"></Column>
                </DataTable>
              </TabPanel>
            </TabView>
          </Dialog>

          <DataTable
            loading={loading}
            size="small"
            scrollable={true}
            value={data}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} voter audit history"
            emptyMessage="No voter audit history."
            header={header}
            responsiveLayout="scroll"
            resizableColumns
            columnResizeMode="expand"
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={['name', 'Firstname', 'IDNumber']}
          >
            <Column field="Firstname" header="Name" sortable></Column>
            <Column
              filterField="Surname"
              field="Surname"
              header="Surname"
              sortable
            ></Column>
            <Column field="IDNumber" header="IDNumber"></Column>
            <Column
              field="active"
              header="Status"
              body={(e) =>
                e?.RegistrationNumber ? (
                  <Button
                    label="Active"
                    style={{ textAlign: 'center', height: '30px' }}
                    className="p-button-success p-button-rounded"
                  />
                ) : (
                  <Button
                    label="Not Active"
                    style={{ textAlign: 'center', height: '30px' }}
                    className="p-button-danger p-button-rounded"
                  />
                )
              }
              sortable
            ></Column>
            <Column
              field="action"
              header="Action"
              body={(item) => (
                <>
                  <Button
                    onClick={(e) => {
                      setShowDialog(true);
                      setSelectedUser(item);

                      
                      var objectionsService = new ObjectionsService()
                      if (selectedUser?.RegistrationNumber) {
                        objectionsService
                          .getObjectionsByID(selectedUser.RegistrationNumber)
                          .then((e) => {
                            console.log(e)
                            setObjection(e)
                          })
                      }


                    }}
                    tooltip="Click to View"
                    icon={'pi pi-eye'}
                    tooltipOptions={{ position: 'top' }}
                    className=" p-button-rounded mr-2"
                  />
                </>
              )}
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  )
}
