import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventTypeService() {
    this.getAllEventTypes = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventType?id=${id}`;
        return axios.get(url).then((response) => response.data);
    };
}
