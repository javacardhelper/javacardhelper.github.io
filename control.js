$().ready(function() {

    function getDefaultQuantities() {
        return [{
                "Name": "MAX_BALANCE",
                "Value": "32767"
            },
            {
                "Name": "MAX_TRANSACTION_AMOUNT",
                "Value": "127"
            },
            {
                "Name": "PIN_TRY_LIMIT",
                "Value": "3"
            },
            {
                "Name": "MAX_PIN_SIZE",
                "Value": "8"
            }
        ];
    }

    function getDefaultInstructionBytes() {
        return [{
                "Name": "VERIFY",
                "Value": "0x20"
            },
            {
                "Name": "CREDIT",
                "Value": "0x30"
            },
            {
                "Name": "DEBIT",
                "Value": "0x40"
            },
            {
                "Name": "GET_BALANCE",
                "Value": "0x50"
            }
        ]
    }

    function getDefaultErrorCodes() {
        return [{
                "Name": "SW_NO_ERROR",
                "Value": "0x9000"
            },
            {
                "Name": "SW_VERIFICATION_FAILED",
                "Value": "0x6300"
            },
            {
                "Name": "SW_PIN_VERIFICATION_REQUIRED",
                "Value": "0x6301"
            },
            {
                "Name": "SW_INVALID_TRANSACTION_AMOUNT",
                "Value": "0x6A83"
            },
            {
                "Name": "SW_EXCEED_MAXIMUM_BALANCE",
                "Value": "0x6A84"
            },
            {
                "Name": "SW_NEGATIVE_BALANCE",
                "Value": "0x6A85"
            },
            {
                "Name": "ISO7816.SW_CLA_NOT_SUPPORTED",
                "Value": "0x6E00"
            },
            {
                "Name": "ISO7816.SW_INS_NOT_SUPPORTED",
                "Value": "0x6D00"
            },
            {
                "Name": "ISO7816.SW_WRONG_LENGTH",
                "Value": "0x6700"
            }
        ]
    }

    function setConstants(table, constants) {
        let tableBody = table.children("tbody").eq(0);
        tableBody.html("");
        $.each(constants, function(_, constant) {
            tableBody.append($("<tr>").append([$("<td>").html(constant["Name"]), $("<td>").html(constant["Value"])]));
        });
    }

    let QUANTITIES = undefined;
    let INSTRUCTION_BYTES = undefined;
    let ERROR_CODES = undefined;

    function setDefaultQuantities() {
        QUANTITIES = getDefaultQuantities();
        setConstants($("#quantities-table"), QUANTITIES);
    }

    function setDefaultInstructionBytes() {
        INSTRUCTION_BYTES = getDefaultInstructionBytes();
        setConstants($("#instruction-bytes-table"), INSTRUCTION_BYTES);
        const instructionByteSelect = $("#instruction-byte-select");
        instructionByteSelect.html("");
        $(INSTRUCTION_BYTES).each(function() {
            const instructionByteName = this["Name"];
            instructionByteSelect.append($("<option>", {
                value: instructionByteName,
                text: instructionByteName
            }));
        });
    }

    function setDefaultErrorCodes() {
        ERROR_CODES = getDefaultErrorCodes();
        setConstants($("#error-codes-table"), ERROR_CODES);
    }

    setDefaultQuantities();
    setDefaultInstructionBytes();
    setDefaultErrorCodes();

    $(".drop-down-panel").each(function() {
        const children = $(this).children();
        const header = children.first();
        const content = children.last();
        header.click(function() {
            content.toggle({
                duration: "fast",
                easing: "linear"
            });
        });
    });

    $(".error-input").prop("disabled", true).hide();
    $(".initially-closed").each(function() {
        $(this).children(":last").hide();
    });

    $("input").val("");
    $(".initially-unchecked").prop("checked", false);
    $(".initially-checked").prop("checked", true);
    $(".copy-button").click(function() {
        $(this).prev().select();
        document.execCommand("copy");
    });

    function displayError(errorInputIndex, errorMessage) {
        $(".error-input").eq(errorInputIndex).val(errorMessage).show();
    }

    function resetError(errorInputIndex) {
        $(".error-input").eq(errorInputIndex).val("").hide();
    }

    function addConstant(addConstantButton, constantsList, afterConstantAdded) {
        const valueDiv = addConstantButton.prev();
        const initialValue = valueDiv.children(":first").val();
        let constantValue = initialValue.trim().toUpperCase();
        const constantName = valueDiv.prev().children(":first").val().trim();
        const parsedValue = parseInt(constantValue);
        if (!isNaN(parsedValue)) {
            if (!constantValue.substring(0, 2).localeCompare("0X"))
                constantValue = "0x" + constantValue.substring(2);
            addConstantButton.next().next().append($("<tr>").append([$("<td>", {
                text: constantName
            }), $("<td>", {
                text: constantValue
            })]));
            resetError(0);
            const newConstant = {
                "Name": constantName,
                "Value": constantValue
            };
            constantsList.push(newConstant);
            if (afterConstantAdded !== undefined)
                afterConstantAdded(newConstant);

        } else
            displayError(0, "Cannot parse '" + initialValue + "'.");
    }

    function afterInstructionByteAdded(instructionByte) {
        const instructionByteName = instructionByte["Name"]
        $("#instruction-byte-select").append($("<option>", {
            value: instructionByteName,
            text: instructionByteName
        }));
    }

    function resetConstants(setDefaultConstants) {
        resetError(0);
        setDefaultConstants();
    }

    function setupConstantsPanel() {
        $(".add-constant-button").each(function(index) {
            $(this).click(function() {
                addConstant($(this), [QUANTITIES, INSTRUCTION_BYTES, ERROR_CODES][index], [undefined, afterInstructionByteAdded][index])
            });
        });
        $(".reset-constant-button").each(function(index) {
            $(this).click(function() {
                resetConstants([setDefaultQuantities, setDefaultInstructionBytes, setDefaultErrorCodes][index])
            });
        });
    }

    setupConstantsPanel();

    function convert(initialValue, binaryText) {
        const parsedValue = parseInt(binaryText, 2);
        if (!isNaN(parsedValue)) {
            $("#decimal-input").val(parsedValue.toString(10));
            $("#hexadecimal-input").val("0x" + parsedValue.toString(16).toUpperCase());
            $("#binary-input").val(parsedValue.toString(2));
            let decimalBytesText = "",
                hexadecimalBytesText = "",
                binaryBytesText = "";
            for (let index = 0; index < binaryText.length; index += 8) {
                const byteValue = binaryText.substring(index, index + 8);
                const parsedValue = parseInt(byteValue, 2);
                decimalBytesText += " " + parsedValue.toString(10);
                hexadecimalBytesText += " 0x" + parsedValue.toString(16).toUpperCase();
                binaryBytesText += " " + byteValue;
            }
            $("#decimal-bytes-input").val(decimalBytesText.trim());
            $("#hexadecimal-bytes-input").val(hexadecimalBytesText.trim());
            $("#binary-bytes-input").val(binaryBytesText.trim());
            resetError(1);
        } else
            displayError(1, "Cannot parse '" + initialValue + "'.");
    }

    function setupConvertionInput(conversionInput, base) {
        const initialValue = conversionInput.val();
        const parts = initialValue.trim().toUpperCase().split(/ +/);
        let binaryText = "";
        $(parts).each(function() {
            let toParse = this;
            if (base === 16 && this.substring(0, 2).localeCompare("0X"))
                toParse = "0X" + toParse;
            const parsedValue = parseInt(toParse, base);
            if (!isNaN(parsedValue)) {
                let binaryValue = parsedValue.toString(2);
                const neededZerosCount = binaryValue.length % 8;
                if (neededZerosCount)
                    binaryValue = new Array(9 - neededZerosCount).join("0") + binaryValue;
                binaryText += binaryValue;
            } else {
                binaryText = undefined;
                return false;
            }
        });
        convert(initialValue, binaryText);
    }

    $(["decimal-input", "decimal-bytes-input", "hexadecimal-input", "hexadecimal-bytes-input", "binary-input", "binary-bytes-input"]).each(function(index) {
        const conversionInput = $("#" + this);
        conversionInput.keypress(function(event) {
            if (event.which === 13)
                setupConvertionInput(conversionInput, [10, 10, 16, 16, 2, 2][index]);
        });
    });

    function createCommand() {
        let lcBytes = "",
            leBytes = "";
        if ($("#lc-present").prop("checked")) {
            const initialValue = $("#lc-input").val();
            const lcText = initialValue.trim();
            if ($("#lc-for-value").prop("checked")) {
                const parsedValue = parseInt(lcText, 10);
                if (!isNaN(parsedValue)) {
                    const hexadecimalString = parsedValue.toString(16).toUpperCase();
                    for (let index = hexadecimalString.length; index > 0; index -= 2)
                        lcBytes = " 0x" + hexadecimalString.substring(index - 2, index) + lcBytes;
                    lcBytes = lcBytes.trim();
                    resetError(2);
                } else {
                    displayError(2, "Cannot parse '" + initialValue + "'.");
                    lcBytes = undefined;
                }

            } else {
                $(lcText.split(/ +/)).each(function() {
                    const part = this.toUpperCase();
                    if (part.substring(0, 2).localeCompare("0X"))
                        lcBytes += " " + "0x" + part;
                    else
                        lcBytes += " " + "0x" + part.substring(2);
                });
                lcBytes = lcBytes.trim();
            }
        }
        if ($("#le-present").prop("checked")) {
            const initialValue = $("#le-input").val();
            const leText = initialValue.trim().toUpperCase();
            if ($("#le-for-value").prop("checked")) {
                const parsedValue = parseInt(leText, 10);
                if (!isNaN(parsedValue)) {
                    leBytes = "0x" + Math.ceil(parsedValue.toString(16).length / 2).toString(16).toUpperCase();
                    resetError(2);
                } else {
                    displayError(2, "Cannot parse '" + initialValue + "'.");
                    leBytes = undefined;
                }
            } else {
                if (leText.substring(0, 2).localeCompare("0X"))
                    leBytes = "0x" + leText;
                else
                    leBytes = "0x" + leText.substring(2);
            }
        }
        if (lcBytes !== undefined && leBytes !== undefined) {
            let command = "0x80";
            const selectedInstructionName = $("#instruction-byte-select").val();
            $(INSTRUCTION_BYTES).each(function() {
                if (!this["Name"].localeCompare(selectedInstructionName)) {
                    command += " " + this["Value"].toString();
                    return false;
                }
            });
            command += " 0x00 0x00";
            if (lcBytes.length)
                command += " " + "0x" + lcBytes.split(" ").length.toString(16).toUpperCase() + " " + lcBytes;
			else 
				command += " 0x00";
            if (leBytes.length)
                command += " " + leBytes;
            if (lcBytes.length && !leBytes.length)
                command += " 0x7F";
            command += ";";
            $("#created-command-input").val(command);
        }
    }

    $("#lc-input, #le-input").keypress(function(event) {
        if (event.which === 13)
            createCommand();
    });

    function getDeviceCommandData() {
        const commandData = {};
        const commandText = $("#sd-command-input").val().trim();
        let instructionByteValue = commandText.substring(commandText.indexOf("INS:") + 4, commandText.indexOf("P1:") - 2);
        $(INSTRUCTION_BYTES).each(function() {
            if (!this.Value.substring(2).localeCompare(instructionByteValue.trim())) {
                commandData.instructionByte = this.Name;
                return false;
            }
        });

        function getValueAndBytes(startText, endText) {
            const data = {};
            const subcommandText = commandText.substring(commandText.indexOf(startText) + startText.length, commandText.indexOf(endText));
            let parts = subcommandText.split(",");
            data.value = parseInt(parts[0], 16).toString();
            parts = parts.slice(1, parts.length - 1);
            let bytes = "",
                decimalValue = "";
            $(parts).each(function() {
                bytes += " " + this.trim();
                decimalValue += this.trim();
            });
            data.bytes = bytes.trim();
            data.decimalValue = parseInt(decimalValue, 16);
            if (isNaN(data.decimalValue))
                data.decimalValue = "0";
            return data;
        }
        commandData.lcData = getValueAndBytes("Lc:", "Le:");
        commandData.leData = getValueAndBytes("Le:", "SW1:");
        let status = commandText.substring(commandText.indexOf("SW1:") + 4);
        let sw = status.substring(0, status.indexOf(",")).trim() + status.substring(status.length - 2).trim();
        $(ERROR_CODES).each(function() {
            if (!this.Value.substring(2).toLowerCase().localeCompare(sw)) {
                commandData.statusName = this.Name;
                commandData.statusValue = "0x" + sw;
                return false;
            }
        });
        return commandData;
    }

    function analyzeSampleDeviceCommand() {
        $("#sd-command-instruction-paragraph, #sd-command-lc-paragraph, #sd-command-le-paragraph, #sd-command-status-paragraph").text("");
        let deviceCommandData = getDeviceCommandData();
        $("#sd-command-instruction-paragraph").text(deviceCommandData.instructionByte);
        $("#sd-command-lc-paragraph").text("Value: " + deviceCommandData.lcData.value + " Bytes: " + deviceCommandData.lcData.bytes + " Decimal: " + deviceCommandData.lcData.decimalValue);
        $("#sd-command-le-paragraph").text("Value: " + deviceCommandData.leData.value + " Bytes: " + deviceCommandData.leData.bytes + " Decimal: " + deviceCommandData.leData.decimalValue);
        $("#sd-command-status-paragraph").text("Value: " + deviceCommandData.statusValue + " Description: " + deviceCommandData.statusName);
    }

    $("#sd-command-input").keypress(function(event) {
        if (event.which === 13)
            analyzeSampleDeviceCommand();
    });


});