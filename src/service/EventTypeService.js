import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventTypeService() {
    this.getAllEventTypes = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventTypeC?id=${id}`;
        return axios.get(url).then((response) => response.data);
    };
    this.getEventTypes = () => {
        var url = `${NET_IP}/EventManagement/GetEventTypesall`;
        return axios.get(url).then((response) => response.data);
    };
}
