// ==UserScript==
// @name         Questionnaire
// @namespace    http://tampermonkey.net/
// @version      0.2.14
// @description  Autofill the Watchman Implant Questionnaire
// @author       Adam Meyers
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @match        https://www.tampermonkey.net/index.php?version=4.13&ext=dhdg&updated=true
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// @include      http://localhost:3000/questionnaire
// @include      https://watchman-spur.stage.apps.bsci.com/questionnaire
// @include      https://watchman-spur.dev.apps.bsci.com/questionnaire
// @run-at document-idle
// ==/UserScript==

(function() {
    'use strict';

    $(document).ready(function() {
        armButton();
    })

    const wait = 500;
    let qualified = true;
    let haltAutofill = false;
    let d = new Date().valueOf();
    let uniqueLastName = convertIntToString(d);
    let email = d + '@test.com';

    let floatingMenu = document.createElement("span");
    floatingMenu.setAttribute("id", "floatingMenu");
    floatingMenu.setAttribute("style", "right: 30px;top: 80px; position:fixed; visibility: visible;display: flex;flex-flow: column; row-gap: 10px;");


    let qualifiedBtn = document.createElement("BUTTON");
    qualifiedBtn.setAttribute('content', 'Autofill Qualified Form');
    qualifiedBtn.textContent = "Autofill Qualified Form"
    qualifiedBtn.setAttribute("style", "background: skyblue; font-family: sans-serif; padding: 10px; border-radius: 10px;");
    qualifiedBtn.onclick = fillFormQualified;

    let unqualifiedBtn = document.createElement("BUTTON");
    unqualifiedBtn.setAttribute('content', 'Autofill Unqualified Form');
    unqualifiedBtn.textContent = "Autofill Unqualified Form"
    unqualifiedBtn.setAttribute("style", "background: firebrick; font-family: sans-serif; padding: 10px; border-radius: 10px;");
    unqualifiedBtn.onclick = fillFormUnqualified;

    floatingMenu.appendChild(qualifiedBtn);
    floatingMenu.appendChild(unqualifiedBtn);
    $(document.body).append(floatingMenu);

    init();

    function armButton() {
        setTimeout( function () {
            // hide button and unbind arrive if user doesn't use it
            $("#question_1001 .v-btn__content").on("click", function() {
                // console.log("clicked button");
                haltAutofill = true;
                $(document).unbindArrive();
                document.getElementById("floatingMenu").style.visibility = "hidden";
                // doesn't always work??
                setTimeout($(document).unbindArrive(), 10);
            });
        }, 200);
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
        // unbind click on btn
        $("#question_1001 .v-btn__content").prop("onclick", null).off("click");

        // first q should be onscreen and not need to wait
        $(".yes").click();
        setTimeout( function () {
            $(".v-btn__content").click();
        }, wait);
    }

    window.onpopstate = function(){
        document.getElementById("floatingMenu").style.visibility = "visible";
        console.log("POPPIN....");
        d = new Date().valueOf();
        uniqueLastName = convertIntToString(d);
        email = d + '@test.com';
        armButton();
        haltAutofill = false;
    };

    function init() {
        //  2nd question
        $(document).arrive("#question_content_1002", function () {
            if (haltAutofill) {
                return;
            }
            if (qualified) {
                $(".yes").click();
            } else {
                $(".no").click();
            }

            setTimeout( function () {
                $(".v-btn__content").click();
            }, wait/2)

        });

        // sex and DOB
        $(document).arrive("input[type=text]", function () {
            if (haltAutofill) {
                return;
            }           
            // sex
            $(".v-input--selection-controls__ripple").click();
            // dob
            $("input[type=text]").val("11111911").blur();
            setTimeout( function () {
                $(".v-btn__content").click();
            }, wait);

        });

        // Q4
        $(document).arrive("#option_10041", function () {
            if (haltAutofill) {
                return;
            }            
            $("#option_10041").click();
            if (qualified) {
                setTimeout( function () {
                   $("#option_10042").click();
                }, wait/3);
                setTimeout( function () {
                    $("#option_10043").click();
                }, wait/2);
            }
            setTimeout( function () {
                $(".v-btn__content").click();
            }, wait);
        });

        // Q5
        $(document).arrive("#option_10051", function () {
            if (haltAutofill) {
                return;
            }            
            $("#option_10051").click();
            if (qualified) {
                setTimeout( function () {
                    $("#option_10052").click();
                }, wait/3);
                setTimeout( function () {
                    $("#option_10053").click();
                }, wait/2);

            }
            setTimeout( function () {
                $(".v-btn__content").click();
            }, wait);
        });

        // Q6
        $(document).arrive("#option_10061", function () {
            if (haltAutofill) {
                return;
            }            
            $("#option_10061").click();
            if (qualified) {
                setTimeout( function () {
                    $("#option_10062").click();
                }, wait/3);
                setTimeout( function () {
                    $("#option_10063").click();
                }, wait/2);
            }
            setTimeout( function () {
                $(".v-btn__content").click();
            }, wait);
        });

        // Name/address/dob
        $(document).arrive(".form-entry-header", function () {
            if (haltAutofill) {
                return;
            }            
            setTimeout( function () {


                $("input[inputmode=numeric]").val("90210")[0].dispatchEvent(new Event('input'));
                $("input[type=text]:not('[inputmode=numeric]')").val("firstTest" + (qualified ? "" : "UNqualified"))[0].dispatchEvent(new Event('input'));
                $("input[type=text]:not('[inputmode=numeric]')").val("lastTest" + uniqueLastName + (qualified ? "" : "UNqualified"))[1].dispatchEvent(new Event('input'));
                $("input[type=email]").val(email)[0].dispatchEvent(new Event('input'));
                //             $vm0.firstNAme = "first";
                //             $vm1.lastName = "last";
                //             $vm.emailAddress = email;

            }, wait/3);

        });

        // Phone modal
        $(document).arrive(".phone-modal", function () {
            // sex and DOB
            setTimeout( function () {
                $("input[type=tel]").val("2223334444")[0].dispatchEvent(new Event('input'));
            }, wait/3);
        });
    }
})();