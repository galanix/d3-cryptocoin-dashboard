import React from "react";

import Header from "../../General/Header";
import Dropdown from "../../General/Dropdown";
import CalendarForm from "../../General/CalendarForm";
import ButtonGroup from "../../General/ButtonGroup";

const BitcoinHistoryGraph = () => (
    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">                        
        <section id="history" className="row x_panel">
            <Header classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
                    titleText="Bitcoin History"
            />
            <div className="col-md-12 col-sm-12 col-xs-12">
                <Dropdown classesCSS={{
                            container: "well",
                            button: "btn-success"
                        }}
                        titleText="Currency"
                        options={[
                            { dataValue:"USD" },
                            { dataValue:"EUR" },
                            { dataValue:"RUB" },
                            { dataValue:"UAH" },
                        ]}
                />
                <div className="well" style={{ "overflow" : "auto"}}>
                    <CalendarForm name="start-date" id="start-date" />
                    <CalendarForm name="end-date" id="end-date" />
                </div>                
                <ButtonGroup classesCSS="well btn-group full-width"
                          buttons={[
                            { attrs: { "data-timeline": "all-time" },
                              classesCSS:"btn-success",
                              textValue: "All time"
                            },
                            { attrs: { "data-timeline": "1-year" },
                              classesCSS: "btn-success",
                              textValue: "Year"
                            },
                            { attrs: { "data-timeline": "6-month" },
                              classesCSS: "btn-success",
                              textValue: "6 months"
                            },
                            { attrs: { "data-timeline": "3-month" },
                              classesCSS: "btn-success",
                              textValue: "3 months"
                            },
                            { attrs: { "data-timeline": "1-month" },
                              classesCSS: "btn-success active",
                              textValue: "1 month"
                            },
                            { attrs: { "data-timeline": "1-week" },
                              classesCSS: "btn-success",
                              textValue: "week"
                            },
                          ]}
                />
            </div>                                                        
            <div className="graph col-md-12 col-sm-12 col-xs-12"></div>
        </section>                        
    </div> 
);
    
export default BitcoinHistoryGraph;