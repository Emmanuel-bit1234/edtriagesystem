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
import { Dropdown } from 'primereact/dropdown'
import { Divider } from 'primereact/divider'
import { Timeline } from 'primereact/timeline'
export const VoterAuditHistory = () => {
  const [showDialog, setShowDialog] = useState(false)
  const [showHistroyDialog, setShowHistroyDialog] = useState(false)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
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
    setLoading(true)
    voterAuditHistory
      .getAuditHistoryByID(idNumber)
      .then((e) => {
        console.log(e)
        setData(e?.AHVoters ? e.AHVoters : [])
        setLoading(false)

        var res = e?.AHVoters ? e.AHVoters : []
        if (res.length > 0) {
          if (res.length == 1) {
            // setShowDialog(true)
            setSelectedUser(res[0])
          } else {
            // setShowDialog(true)
          }
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error Message',
            detail: 'No voter Found with the specified details.',
            life: 3000,
          })
        }
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
        col1: 'Gender:',
        col2: gender,
        col3: 'Date of birth:',
        col4: selectedUser?.DateOfBirth,
      },
      {
        col1: 'Email:',
        col2: selectedUser?.Email_address,
        col3: 'Contact Number:',
        col4: selectedUser?.Contact_Number,
      },
      {
        col1:"Disability:",
        col2:"N/A",
        col3: 'Registration Number:',
        col4: selectedUser?.RegistrationNUmber,
      },
    ]
  }

  function ChannelDetails() {
    return [
      {
        col1: 'Channel:',
        col2: 'Assisted',
        col3: 'Centre:',
        col4: 'Butha Butha',
      },
      {
        col1: 'Created Date:',
        col2: selectedUser?.DateRegistered,
      },
    ]
  }

  function RegistrationDetails() {
    return [
      {
        col1: 'District:',
        col2: 'N/A',
        col3: 'Constituency:',
        col4: 'N/A',
      },
      {
        col1: 'Registration Centre:',
        col2: 'N/A',
        col3: 'Village:',
        col4: 'N/A',
      },
    ]
  }

  function CommunicationDetails() {
    return [
      {
        col1: 'Message Channel:',
        col2: 'Email',
      },
      {
        col1: 'Message:',
        col2: 'Your application has been recieved',
      },
      {
        col1: 'Date Sent:',
        col2: '20 jan 2022',
      },
      {
        col1: 'Send Status:',
        col2: 'failed',
      },
    ]
  }



  var searchCriteria = [
    {
      name: 'Search By Id Number',
      value: 0,
    },
    {
      name: 'Search By Registration Number',
      value: 1,
    },
  ]
  var [selectedCriteria, setSelectedCriteria] = useState(searchCriteria[0])

  function VotersDetailsTable({ data = [], header = '' }) {
    return (
      <DataTable
        header={header}
        size="small"
        scrollable={true}
        value={data}
        dataKey="id"
        responsiveLayout="scroll"
        style={{ width: '100%' }}
      >
        <Column
          // style={{ width: '100px' }}
          field="col1"
          body={(e) => <b>{e.col1}</b>}
        ></Column>
        <Column field="col2"></Column>
        <Column
          // style={{ width: '100px' }}
          field="col3"
          body={(e) => <b>{e.col3}</b>}
        ></Column>
        <Column field="col4"></Column>
      </DataTable>
    )
  }



  function InlineTable({ data = [], header = '' }) {
    return (
      <DataTable
        header={header}
        size="small"
        scrollable={true}
        value={data}
        dataKey="id"
        responsiveLayout="scroll"
        style={{ width: '100%' }}
      >
        <Column
          // style={{ width: '100px' }}
          field="col1"
          body={(e) => <b>{e.col1}</b>}
        ></Column>
        <Column field="col2"></Column>
      </DataTable>
    )
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
                    placeholder={selectedCriteria.name}
                    value={idNumber}
                    onInput={(e) => setIdNumber(e.target.value)}
                  />
                  <Dropdown
                    className="ml-4"
                    optionLabel="name"
                    onChange={(e) => setSelectedCriteria(e.value)}
                    options={searchCriteria}
                    value={selectedCriteria}
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
            <Column
              filterField="Surname"
              field="Surname"
              header="Surname"
              sortable
            ></Column>
            <Column field="Firstname" header="Firstname" sortable></Column>

            <Column field="Village" header="Village" sortable></Column>
            <Column field="CreatedDate" header="Created Date"></Column>
            <Column
              field="active"
              header="Status"
              body={(e) =>
                e?.RegistrationNUmber ? (
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
                      setShowDialog(true)
                      setSelectedUser(item)

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

          <Dialog
            header={<h6>{`Voter Details -  ${selectedUser?.Surname}, ${selectedUser?.Firstname}  (${selectedUser?.IDNumber})`}</h6>}
            // footer={
            //   <>
            //     <Button
            //       label="Messaging History"
            //       className="ml-3"
            //       onClick={(e) => setShowCommunicationDialog(true)}
            //     />
            //     <Button
            //       label="Voter History"
            //       onClick={(e) => setShowHistroyDialog(true)}
            //     />
            //   </>
            // }
            visible={showDialog}
            style={{ width: '73%', height: '98vh' }}
            modal
            onHide={(e) => {
              setShowDialog(false)
            }}
          >
            <TabView>
              <TabPanel header="Voter Record">
                <VotersDetailsTable
                  header={
                    <h6>
                      {' '}
                      <b>Voter Details</b>
                    </h6>
                  }
                  data={VoterDetails()}
                />
                <br />
                <VotersDetailsTable
                  header={
                    <h6>
                      {' '}
                      <b> Delimitation</b>
                    </h6>
                  }
                  data={RegistrationDetails()}
                />
                <br />
                <VotersDetailsTable
                  header={
                    <h6>
                      {' '}
                      <b>Registration Channel</b>
                    </h6>
                  }
                  data={ChannelDetails()}
                />
              </TabPanel>

              {selectedUser?.status !== null ? (
                <TabPanel header="Anomalies">
                
                </TabPanel>
              ) : (
                ''
              )}

              {selectedUser?.status !== null ? (
                <TabPanel header="Anomalies">No Content</TabPanel>
              ) : (
                ''
              )}

               {selectedUser?.status !== null ? (
                <TabPanel header="Anomalies">No Content</TabPanel>
              ) : (
                ''
              )}
 
              {selectedUser?.status !== null ? (
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
                    <Column
                      header="RegistrationNumber"
                      body={selectedUser?.RegistrationNumber}
                    ></Column>
                    <Column field="DateLodged" header="DateLodged"></Column>
                  </DataTable>
                </TabPanel>
              ) : (
                ''
              )}
            </TabView>
          </Dialog>

          <Dialog
            header={`Voter Audit History - ${selectedUser?.Surname}, ${selectedUser?.Firstname}  (${selectedUser?.IDNumber})`}
            visible={showHistroyDialog}
            style={{ width: '95%', height: '95%' }}
            modal
            onHide={(e) => {
              setShowHistroyDialog(false)
            }}
          >
            <div className="flex">
              <div style={{ flex: '2' }}>
                <h6>
                  <b>Number of Records(3)</b>
                </h6>
                <ul className="p-orderlist-list" style={{ height: '90vh' }}>
                  <li className="p-orderlist-item card" style={{ padding: 8 }}>
                    15/10/2020 16:15 name surname
                  </li>
                  <li className="p-orderlist-item card" style={{ padding: 8 }}>
                    15/10/2020 16:15 name surname
                  </li>
                  <li className="p-orderlist-item card" style={{ padding: 8 }}>
                    15/10/2020 16:15 name surname
                  </li>
                </ul>
              </div>
              <Divider layout="vertical" />
              <div style={{ flex: '4.5' }}>
                <TabView>
                  <TabPanel header="Voter Details">
                    <VotersDetailsTable data={VoterDetails()} />
                  </TabPanel>
                </TabView>
              </div>
            </div>
          </Dialog>

          <Dialog
            header={`Voter Communication History - ${selectedUser?.Surname}, ${selectedUser?.Firstname}  (${selectedUser?.IDNumber})`}
            visible={showCommunicationDialog}
            style={{ width: '95%', height: '95%' }}
            modal
            onHide={(e) => {
              setShowCommunicationDialog(false)
            }}
          >
            <div className="flex">
              <div style={{ flex: '2' }}>
                <h6>
                  <b>Number of Records(3)</b>
                </h6>
                <ul className="p-orderlist-list" style={{ height: '90vh' }}>
                  <li className="p-orderlist-item card" style={{ padding: 8 }}>
                    15/10/2020 16:15 email
                  </li>
                  <li className="p-orderlist-item card" style={{ padding: 8 }}>
                    15/10/2020 16:15 sms
                  </li>
                  <li className="p-orderlist-item card" style={{ padding: 8 }}>
                    15/10/2020 16:15 email
                  </li>
                </ul>
              </div>
              <Divider layout="vertical" />
              <div style={{ flex: '4.5' }}>
                <TabView>
                  <TabPanel header="Message Details">
                    <VotersDetailsTable data={CommunicationDetails()} />
                  </TabPanel>
                </TabView>
              </div>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
