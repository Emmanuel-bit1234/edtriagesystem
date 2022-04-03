import React from "react";

export const CandidateReports = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Candidate Reports </h5>
                    <p>Use this page to start from scratch and place your custom content.</p>
                </div>
                <iframe src="https://localhost:44317/MyReport/get" width={"100%"} height="780px"></iframe>
            </div>
        </div>
    );
};
