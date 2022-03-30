import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventService() {
    this.getAllEvents = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventsData?EventGroupID=${id}`;
        return axios.get(url).then((response) => response.data.Events);
    };
    this.getEventBasedOnGroupAndType = (id1,id2) => {
        var url = `${NET_IP}/EventManagement/GetEventsDataByEventType?EventGroupID=${id1}&EventTypeID=${id2}`;
        return axios.get(url).then((response) => response.data.Events);
    };
    this.getByElections = (id) =>{
        var url = `${NET_IP}/EventManagement/GetByElectionOfAnEvent?EventID=${id}`;
        return axios.get(url).then((response) => response.data.Events);
    };
    this.getActiveByElections = (id) => {
        var url = `${NET_IP}/EventManagement/GetActiveByElectionsOfAnEvent?EventID=${id}`
        return axios.get(url).then((response) => response.data.Events);
    }
    this.getAllParentEvents = () => {
        var url = `${NET_IP}/EventManagement/GetParentEvents1`;
        return axios.get(url).then((response) => response.data);
    };
    this.createEvent = (data) => {
        var url = `${NET_IP}/EventManagement/InsertEvent`;
        return axios.post(url, data).then((response) => response.data);
    };
    this.deActivateEvent = (id) => {
        var url = `${NET_IP}/EventManagement/DeleteEvent?id=${id}`;
        return axios.post(url).then((response) => response.data);
    };
    this.deActivateByElection = (id) => {
        var url = `${NET_IP}/EventManagement/DeleteByElectionEvent?id=${id}`;
        return axios.get(url).then((response) => response.data);
    };
}
