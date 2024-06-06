// ==UserScript==
// @name         Questionnaire
// @namespace    http://tampermonkey.net/
// @version      0.5.7
// @description  Autofill the Watchman Implant Questionnaire
// @author       Adam Meyers & Andrew Hamlett
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @match        https://www.tampermonkey.net/index.php?version=4.13&ext=dhdg&updated=true
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// @include      http://localhost:3000/questionnaire*
// @exclude      http://localhost:3000/questionnaire/resubmission*
// @include      http://localhost:3001/questionnaire*
// @exclude      http://localhost:3001/questionnairere/resubmission*
// @include      https://watchman-spur.stage.apps.bsci.com/questionnaire*
// @exclude      https://watchman-spur.stage.apps.bsci.com/questionnaire/resubmission*
// @include      https://watchman-spur-qa.dev.apps.bsci.com/questionnaire*
// @exclude      https://watchman-spur-qa.dev.apps.bsci.com/questionnaire/resubmission*
// @include      https://watchman-spur.dev.apps.bsci.com/questionnaire*
// @exclude      https://watchman-spur.dev.apps.bsci.com/questionnaire/resubmission*
// @run-at document-idle
// ==/UserScript==

(function() {
    'use strict';
    // console.log("starting.........");

    $(document).ready(function () {
        // console.log("document is ready.........");
        getSubmitButtonTop();
    })
    const version = "v0.5.7";
    const wait = 500;
    let qualified = true;
    let d = new Date().valueOf();
    let uniqueLastName = convertIntToString(d);
    let email = d + '@mail.com';
    let submitButtonTop = 700;
    init();

    function getSubmitButtonTop() {
        // console.log("buton type of is " + typeof $("button[type=submit]"))
        if (typeof $("button[type=submit]").position() === "undefined") {
            setTimeout(getSubmitButtonTop, 200);
            return;
        }

        if ( $("button[type=submit]").position().top < 100) {
            setTimeout(getSubmitButtonTop, 200);
            return;
        }

        submitButtonTop = $("button[type=submit]").position().top;
        buildFloatingMenu();
    }

    function buildFloatingMenu() {
        let floatingMenu = document.createElement("DIV");
        floatingMenu.setAttribute("id", "floatingMenu");
        floatingMenu.setAttribute("style", "top: " + submitButtonTop + "px; margin: auto; width: 90%; left: 5%; border: 3px solid #73AD21; padding: 70px; background-color:grey; position:absolute; visibility: visible;display: flex;flex-flow: column; row-gap: 10px; align-items: center; z-index: 9999");


        let qualifiedBtn = document.createElement("BUTTON");
        qualifiedBtn.setAttribute('content', 'Autofill Qualified Form');
        qualifiedBtn.textContent = "Autofill Qualified Form"
        qualifiedBtn.setAttribute("style", "background: rgb(255,255,255); background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(67,185,67,1) 100%); font-family: sans-serif; padding: 10px; border-radius: 10px; width:40%");
        qualifiedBtn.onclick = fillFormQualified;

        let unqualifiedBtn = document.createElement("BUTTON");
        unqualifiedBtn.setAttribute('content', 'Autofill Unqualified Form');
        unqualifiedBtn.textContent = "Autofill Unqualified Form"
        unqualifiedBtn.setAttribute("style", "background: rgb(255,255,255);background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(238,155,41,1) 100%); font-family: sans-serif; padding: 10px; border-radius: 10px; width:40%");
        unqualifiedBtn.onclick = fillFormUnqualified;

        let qualifiedHeadless = document.createElement("BUTTON");
        qualifiedHeadless.setAttribute('content', 'qualified headless');
        qualifiedHeadless.textContent = "Qualified Landing Page (new patient with phone)"
        qualifiedHeadless.setAttribute("style", "background: #80e380; font-family: sans-serif; padding: 10px; border-radius: 10px; width:40%");
        qualifiedHeadless.onclick = qualifiedHeadlessFunc;

        let qualifiedPhoneHeadless = document.createElement("BUTTON");
        qualifiedPhoneHeadless.setAttribute('content', 'qualified No Phone headless');
        qualifiedPhoneHeadless.textContent = "Qualified Landing Page (new patient no phone)"
        qualifiedPhoneHeadless.setAttribute("style", "background: #d7fed7; font-family: sans-serif; padding: 10px; border-radius: 10px; width:40%");
        qualifiedPhoneHeadless.onclick = qualifiedNoPhoneHeadlessFunc;

        let unqualifiedHeadless = document.createElement("BUTTON");
        unqualifiedHeadless.setAttribute('content', 'unqualified  headless');
        unqualifiedHeadless.textContent = "Unqualified Landing Page"
        unqualifiedHeadless.setAttribute("style", "background: #f5b153; font-family: sans-serif; padding: 10px; border-radius: 10px; width:40%");
        unqualifiedHeadless.onclick = unqualifiedHeadlessFunc;

        let cancelBtn = document.createElement("BUTTON");
        cancelBtn.setAttribute('content', 'CANCEL Autofill');
        cancelBtn.textContent = "CANCEL Autofill"
        cancelBtn.setAttribute("style", "background: #F05D5E; font-family: sans-serif; padding: 10px; border-radius: 10px; width:40%");
        cancelBtn.onclick = cancelAutoFill;

        let versionSpan = document.createElement("span");
        versionSpan.textContent = version;
        versionSpan.setAttribute("style", "position:absolute;top:10px;left:10px;");

        let divider = document.createElement("div");
        divider.setAttribute("style", "height:5px;");

        floatingMenu.appendChild(qualifiedBtn);
        floatingMenu.appendChild(unqualifiedBtn);
        floatingMenu.appendChild(divider);
        floatingMenu.appendChild(qualifiedHeadless);
        floatingMenu.appendChild(qualifiedPhoneHeadless);
        floatingMenu.appendChild(unqualifiedHeadless);
        floatingMenu.appendChild(divider.cloneNode());
        floatingMenu.appendChild(cancelBtn);
        floatingMenu.appendChild(versionSpan);
        $(document.body).append(floatingMenu);

    }

    function cancelAutoFill() {
        try {
            $(document).unbindArrive();
        } catch { }
        try {
            Arrive.unbindAllArrive();
        } catch { console.log('Arrive.unbindAllArrive failed......'); }

        document.getElementById("floatingMenu").style.visibility = "hidden";
    }

    function qualifiedHeadlessFunc(){
       let req_body = generateRequestBody()
       let url = window.location.origin
        fetch(`${url}/api/patient`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req_body)
        }).then(response => response.json())
          .then(data => {
            window.location = `${url}/results/${data.patientId}`
        })
    }

    function qualifiedNoPhoneHeadlessFunc(){
       let req_body = generateRequestBody()
       req_body.phone = ""
       let url = window.location.origin
        fetch(`${url}/api/patient`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req_body)
        }).then(response => response.json())
          .then(data => {
            window.location = `${url}/results/${data.patientId}`
        })
    }

    function unqualifiedHeadlessFunc(){
       qualified = false;
       let req_body = generateRequestBody()
       req_body.surveyResponse = "{\"1001\":[{\"parent_option_id\":10011}],\"1002\":[{\"parent_option_id\":10022}],\"1003\":[{\"parent_option_id\":10031}],\"1004\":[{\"parent_option_id\":10041}],\"1005\":[{\"parent_option_id\":10051}],\"1006\":[{\"parent_option_id\":10061}]}"
       let url = window.location.origin
        fetch(`${url}/api/patient`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req_body)
        }).then(response => response.json())
          .then(data => {
            window.location = `${url}/unqualified/${data.patientId}`
        })
    }

    function convertIntToString(num) {
        let val = "";
        for (let i = 0; i < num.toString().length; i++) {
            const digit = num.toString()[i];
            const char = String.fromCharCode(97 + parseInt(digit));
            val += char;
        }
        return val;
    }

    function fillFormQualified() {
        qualified = true
        fillForm();
    }

    function fillFormUnqualified() {
        qualified = false;
        fillForm();
    }

    function fillForm() {
        // hide menu
        document.getElementById("floatingMenu").style.visibility = "hidden";

        // first q should be onscreen and not need to wait
        $(".yes").click();
        setTimeout( function () {
            $("button[type=submit]").click();
        }, wait);
    }

    window.onpopstate = function(){
        // console.log("POPPIN....");
        qualified = true;
        document.getElementById("floatingMenu").style.visibility = "visible";
        d = new Date().valueOf();
        uniqueLastName = convertIntToString(d);
        email = d + '@mail.com';
    };

    function getFirstName() {
        return "firstTest" + (qualified ? "" : "UNqualified");
    }

    function getLastName() {
        return "lastTest" + uniqueLastName + (qualified ? "" : "UNqualified");
    }

    function init() {
        initSurvey1000();
        initSurvey14000();

        // Name/address/dob
        $(document).arrive(".form-entry-header", function () {
            setTimeout( function () {
                $(".zipcode-container input").val("90210")[0].dispatchEvent(new Event('input'));
                $(".first-name-container input").val( getFirstName() )[0].dispatchEvent(new Event('input'));
                $(".last-name-container input").val( getLastName() )[0].dispatchEvent(new Event('input'));
                $(".email-container input").val(email)[0].dispatchEvent(new Event('input'));
                //             $vm0.firstName = "first";
                //             $vm1.lastName = "last";
                //             $vm.emailAddress = email;

            }, wait/3);

        });

        // Phone modal
        $(document).arrive(".phone-modal", function () {
            // sex and DOB
            setTimeout( function () {
                $("input[type=tel]").val(getPhoneNumber())[0].dispatchEvent(new Event('input'));
            }, wait/3);
        });
    }

    function getPhoneNumber(doFullFormat) {
        let pn = d.toString().substring(3);
        if (pn.startsWith('0') || pn.startsWith('1')) {
            pn = "9" + pn.substring(1);
        }
        if (doFullFormat) {
          pn = `+1 (${pn.substring(0,3)}) ${pn.substring(3,6)}-${pn.substring(6,10)}`;
        }
        return pn;
    }

    function generateRequestBody(){
        return {
            "firstName": getFirstName(),
            "lastName": getLastName(),
            "phone": getPhoneNumber(true),
            "email": email,
            "zipCode": "90210",
            "emailValidationRequired": true,
            "emailRequired": true,
            "update": null,
            "dateOfBirth": "11/11/1911",
            "surveyResponse": "{\"1001\":[{\"parent_option_id\":10011}],\"1002\":[{\"parent_option_id\":10021}],\"1003\":[{\"parent_option_id\":10031}],\"1004\":[{\"parent_option_id\":10041},{\"parent_option_id\":10042},{\"parent_option_id\":10043}],\"1005\":[{\"parent_option_id\":10051},{\"parent_option_id\":10052},{\"parent_option_id\":10053}],\"1006\":[{\"parent_option_id\":10061},{\"parent_option_id\":10062},{\"parent_option_id\":10063}]}",
            "surveyId": 1000
        }
    };

    function initSurvey1000() {
        //  2nd question 'prescribed blood thinners?'
        $(document).arrive("#question_content_1002", function () {
            if (qualified) {
                $(".yes").click();
            } else {
                $(".no").click();
            }

            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait/2)

        });

        // sex and DOB
        $(document).arrive("#question_content_1003", function () {
            // sex
            $(".female").click();
            
            // dob
            // $("input[type=text]").val("11111911").blur();
            // Find inputs
            const input = $("input[type=text]");
            // Set value
            input.val('11111911');
            // Create native event
            const event = new Event('input', { bubbles: true });
            // Dispatch the event on "native" element
            input.get(0).dispatchEvent(event);
            
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);

        });

        // Q4
        $(document).arrive("#question_content_1004", function () {
            $("#question_content_1004 label[for='option_10041']").click();
            if (qualified) {
                setTimeout( function () {
                   $("#question_content_1004 label[for='option_10042']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_1004 label[for='option_10043']").click();
                }, wait/2);
            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });

        // Q5
        $(document).arrive("#question_content_1005", function () {
            $("#question_content_1005 label[for='option_10051']").click();
            if (qualified) {
                setTimeout( function () {
                    $("#question_content_1005 label[for='option_10052']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_1005 label[for='option_10053']").click();
                }, wait/2);

            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });

        // Q6
        $(document).arrive("#question_content_1006", function () {
            $("#question_content_1006 label[for='option_10061']").click();
            if (qualified) {
                setTimeout( function () {
                    $("#question_content_1006 label[for='option_10062']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_1006 label[for='option_10063']").click();
                }, wait/2);
            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });
    }

        function initSurvey14000() {
        //  2nd question
        $(document).arrive("#question_content_14002", function () {
            if (qualified) {
                $(".yes").click();
            } else {
                $(".no").click();
            }

            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait/2)
        });

        // sex and DOB
        $(document).arrive("#question_content_14003", function () {
            // sex
            $(".female").click();
            // dob
            $("input[type=text]").val("11111911").blur();
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);

        });

        // Q4
        $(document).arrive("#question_content_14004", function () {
            $("#question_content_14004 label[for='option_140041']").click();
            if (qualified) {
                setTimeout( function () {
                   $("#question_content_14004 label[for='option_140042']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_14004 label[for='option_140043']").click();
                }, wait/2);
            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });

        // Q5
        $(document).arrive("#question_content_14005", function () {
            $("#question_content_14005 label[for='option_140051']").click();
            if (qualified) {
                setTimeout( function () {
                    $("#question_content_14005 label[for='option_140052']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_14005 label[for='option_140053']").click();
                }, wait/2);

            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });

        // Q6
        $(document).arrive("#question_content_14006", function () {
            $("#question_content_14006 label[for='option_140061']").click();
            if (qualified) {
                setTimeout( function () {
                    $("#question_content_14006 label[for='option_140062']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_14006 label[for='option_140063']").click();
                }, wait/2);
            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });

        // Q7
        $(document).arrive("#question_content_14007", function () {
            $("#question_content_14007 label[for='option_140071']").click();
            if (qualified) {
                setTimeout( function () {
                    $("#question_content_14007 label[for='option_140072']").click();
                }, wait/3);
                setTimeout( function () {
                    $("#question_content_14007 label[for='option_140073']").click();
                }, wait/2);
            }
            setTimeout( function () {
                $("button[type=submit]").click();
            }, wait);
        });
    }
})();
