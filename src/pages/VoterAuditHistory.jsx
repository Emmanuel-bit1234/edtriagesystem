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
import VillageService from '../service/VillageService'
import './voterAudit/audit.scss'

/**
 * Converts the old ASP.NET JSON date format to milliseconds
 * @param date
 */
function getDateFromAspNetFormat(date) {
  try {
    const re = /-?\d+/
    const m = re.exec(date)
    return parseInt(m[0], 10)
  } catch (error) {
    return ''
  }
}

export const VoterAuditHistory = () => {
  const toast = useRef(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showHistroyDialog, setShowHistroyDialog] = useState(false)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  var [data, setData] = useState([])
  var [objection, setObjection] = useState([])
  var [selectedUser, setSelectedUser] = useState([])
  var [activeUser, setActiveUser] = useState(null)
  var [idNumber, setIdNumber] = useState('')

  const filters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  }

  const submitForm = () => {
    var voterAuditHistory = new VoterAuditHistoryServices()
    setLoading(true)
    data = []
    setData(data)
    voterAuditHistory
      .getAuditHistoryByID(idNumber)
      .then((e) => {
        console.log(e)

        var res = e?.AHVoters ? e.AHVoters : []

        if (res.length > 0) {
          setSelectedUser(res[0])
          setActiveUser(res[0])

          var d = res.map((item, i) => {
            new VillageService().getVillage(item?.VillageID).then((vil) => {
              var v = { ...item, ...vil }
              v['DateOfBirth'] = new Date(
                getDateFromAspNetFormat(v['DateOfBirth']),
              )
                .toDateString()
                .toString()
              v['DateRegistered'] = new Date(
                getDateFromAspNetFormat(v['DateRegistered']),
              )
                .toDateString()
                .toString()
              data[i] = v
              setData([...data])

              var DisabilityId = item?.DisabilityID
              var VoterRecordSourceID = item?.VoterRecordSourceID
              var RegistrationSiteID = item?.RegistrationSiteID

              voterAuditHistory
                .getChannelData(
                  DisabilityId,
                  VoterRecordSourceID,
                  RegistrationSiteID,
                )
                .then((channelData) => {
                  data[i] = { ...data[i], channel: channelData }
                  console.log(data)
                  setData(data)
                })
            })
          })
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        } else {
          setLoading(false)
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

  const header = (name) => (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">
        <b>{name}</b>
      </h5>
    </div>
  )

  function VoterDetails() {
    var gender = JSON?.parse(localStorage.getItem('genders'))?.filter(
      (e) => e.id === selectedUser?.Gender,
    )[0]?.description

    var DateOfBirth = null
    try {
      var dateofB = selectedUser?.DateOfBirth_s
      DateOfBirth = dateofB.split(' ')[0]
    } catch (error) {}

    return [
      {
        col1: 'Gender:',
        col2: gender,
        col3: 'Date of birth:',
        col4: DateOfBirth,
      },
      {
        col1: 'Email:',
        col2: selectedUser?.Email_address,
        col3: 'Contact Number:',
        col4: selectedUser?.Contact_Number,
      },
      {
        col1: 'Disability:',
        col2: selectedUser?.channel?.DisabilityName
          ? selectedUser.channel.DisabilityName
          : 'N/A',
        col3: 'Registration Number:',
        col4: selectedUser?.RegistrationNUmber,
      },
    ]
  }

  function ChannelDetails() {
    return [
      {
        col1: 'Channel:',
        col2: selectedUser?.channel?.ChannelName
          ? selectedUser.channel.ChannelName
          : 'N/A',
        col3: 'Registration Site:',
        col4: selectedUser?.channel?.RegistrationSiteName
          ? selectedUser.channel.RegistrationSiteName
          : 'N/A',
      },
      {
        col1: 'Date Captured:',
        col2: selectedUser?.DateRegistered_s,
      },
    ]
  }

  function RegistrationDetails() {
    return [
      {
        col1: 'District:',
        col2: selectedUser?.district,
        col3: 'Constituency:',
        col4: selectedUser?.constituency,
      },
      {
        col1: 'Registration Centre:',
        col2: selectedUser?.regCentre,
        col3: 'Village:',
        col4: selectedUser?.village,
      },
    ]
  }

  function CommunicationDetails() {
    return [
      {
        Channel: 'Email',
        Message: 'Your application has been recieved',
        Date: '20 jan 2022',
        Status: 'failed',
      },
      {
        Channel: 'sms',
        Message: 'technical Error',
        Date: '20 jan 2022',
        Status: 'failed',
      },
      {
        Channel: 'Email',
        Message: 'application fail',
        Date: '20 jan 2022',
        Status: 'failed',
      },
    ]
  }

  var searchCriteria = [
    {
      name: 'Search By Id Number',
      val: 0,
    },
    {
      name: 'Search By Registration Number',
      val: 1,
    },
  ]

  var [selectedCriteria, setSelectedCriteria] = useState(searchCriteria[0])

  function VotersDetailsTable({ data = [], header = '' }) {
    return (
      <DataTable
        className="remove-border"
        header={header}
        size="small"
        scrollable={true}
        value={data}
        dataKey="id"
        responsiveLayout="scroll"
        style={{ width: '100%' }}
      >
        <Column field="col1" body={(e) => <b>{e.col1}</b>}></Column>
        <Column field="col2"></Column>
        <Column field="col3" body={(e) => <b>{e.col3}</b>}></Column>
        <Column field="col4"></Column>
      </DataTable>
    )
  }

  return (
    <div className="grid">
      <div className="col-12">
        <Toast ref={toast} />

        <div
          className="card  p-align-stretch vertical-container"
          style={{ minHeight: 'calc(100vh - 9rem)' }}
        >
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
                      style={{ width: '280px' }}
                    />
                    <Dropdown
                      className="ml-4"
                      optionLabel="name"
                      onChange={(e) => {
                        setSelectedCriteria(e.value)
                      }}
                      options={searchCriteria}
                      value={selectedCriteria}
                      style={{ width: '280px' }}
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
            header={header('Voter Audit History')}
            responsiveLayout="scroll"
            resizableColumns
            columnResizeMode="expand"
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={['DateRegistered_s']}
          >
            <Column
              filterField="Surname"
              field="Surname"
              header="Surname"
            ></Column>
            <Column field="Firstname" header="First name"></Column>

            <Column field="village" header="Village"></Column>
            <Column
              field="DateRegistered_s"
              header="Date Captured"
              sortable
            ></Column>
            <Column
              field="active"
              header="Status"
              body={(e) =>
                e?.Status === true ? (
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
                      console.log(item)

                      var objectionsService = new ObjectionsService()
                      if (selectedUser?.RegistrationNUmber) {
                        objectionsService
                          .getObjectionsByID(selectedUser.RegistrationNUmber)
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
                    style={{
                      textAlign: 'center',
                      width: '30px',
                      height: '30px',
                    }}
                  />
                </>
              )}
            ></Column>
          </DataTable>

          <Dialog
            header={
              <h6>{`Voter Details -  ${activeUser?.Surname}, ${activeUser?.Firstname}  (${activeUser?.IDNumber})`}</h6>
            }
            draggable={false}
            visible={showDialog}
            style={{ width: '95%', height: '95vh' }}
            modal
            onHide={(e) => {
              setShowDialog(false)
            }}
          >
            <TabView>
              <TabPanel header="Voter Record">
                <VotersDetailsTable
                  header={header('Voter Details')}
                  data={VoterDetails()}
                />
                <br />
                <VotersDetailsTable
                  header={header('Delimitation')}
                  data={RegistrationDetails()}
                />
                <br />
                <VotersDetailsTable
                  header={header('Registration Channel')}
                  data={ChannelDetails()}
                />
              </TabPanel>

              {selectedUser?.Status === true ? (
                <TabPanel header="Communication">
                  <DataTable
                    size="small"
                    scrollable={true}
                    value={CommunicationDetails()}
                    dataKey="id"
                    responsiveLayout="scroll"
                    style={{ width: '100%' }}
                  >
                    <Column field="Date" header="Date"></Column>
                    <Column field="Channel" header="Messaging Channel"></Column>
                    <Column field="Message" header="Message"></Column>

                    <Column field="Status" header="Status"></Column>
                  </DataTable>
                </TabPanel>
              ) : (
                ''
              )}

              {selectedUser?.Status === true ? (
                <TabPanel header="Anomalies">No Content</TabPanel>
              ) : (
                ''
              )}

              {selectedUser?.Status === true ? (
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
                    <Column field="ObjectionType" header="Type"></Column>
                    <Column field="ObjectionStatus" header="Status"></Column>
                    <Column field="DateLodged" header="Date Lodged"></Column>
                    <Column field="LodgedBy" header="Lodged By"></Column>
                    {/* <Column
                      field="DateRegistered"
                      header="Date Captured"
                    ></Column> */}
                    <Column
                      field="ObjectionDescription"
                      header="Description"
                    ></Column>
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
