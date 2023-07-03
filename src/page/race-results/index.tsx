/********************************************
    Race Result screen
    src: src/page/race-results/index.tsx
******************************/

import React, { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { MenuItem, Select, Chip, Stack } from "@mui/material";
import {
    TableRow,
    TableHead,
    TableCell,
    TableBody,
    Table,
    Grid,
    Box,
    InputLabel,
    TableContainer,
    Paper,
} from "@mui/material";

import { DataContent, DataType } from "../../types";
import dataCrawl from "../../data/index.json";
const result = dataCrawl as any;

const RaceResult: React.FC = () => {
    const [dataContent, setDataContent] = useState<any[]>([]);
    const [dataResult, setDataResult] = useState<any[]>([]);
    const dataYear = [...Array(3)].map((_, i) => (new Date().getFullYear() - i).toString());
    const dataType: DataType[] = [
        {
            title: "Races",
            value: "races",
        },
        {
            title: "DRIVERS",
            value: "drivers",
        },
        {
            title: "Teams",
            value: "team",
        },
        {
            title: "DHL FASTEST LAP AWARD",
            value: "fastest-laps",
        },
    ];

    const [yearSelectd, setYearSelected] = useState<string>(dataYear[0]);
    const [typeSelectd, setTypeSelectd] = useState<string>(dataType[0]?.value);
    const [contentSelected, setContentSelected] = useState<string>("");

    /**
     * action run when change Select Year or Type
     */
    useEffect(() => {
        setDataContent(result[yearSelectd][typeSelectd]);
    }, [yearSelectd, typeSelectd]);

    /**
     * action run when dataContent changed
     * setContentSelected to first data
     */
    useEffect(() => {
        setContentSelected(dataContent[0]?.value || "");
    }, [dataContent]);

    /**
     * Action run when change value Chip component
     */
    useEffect(() => {
        let data = result[yearSelectd][typeSelectd];
        // Nếu contentSelected === "" thì lấy hết data của type đó.
        data = contentSelected
            ? data.find((i: DataContent) => i.value === contentSelected)?.result
            : data.flatMap((i: DataContent) => i.result);
        setDataResult(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentSelected]);

    /**
     * function click to component Select or Tabs
     * @param key {string} - name of component
     * @param e {SelectChangeEvent}
     */
    const handleChange = (key: string, e: SelectChangeEvent) => {
        switch (key) {
            case "YEAR":
                setYearSelected(e.target.value);
                break;
            case "TYPE":
                setTypeSelectd(e.target.value);
                break;
            default:
                break;
        }
    };

    /**
     * function click to component Chip
     * @param value {string}
     */
    const handleChangeChip = (value: string) => {
        setContentSelected(value);
    };

    return (
        <Box component="div" sx={{ margin: 2 }}>
            <Grid container spacing={2}>
                {/* Select Year */}
                <Grid item xs={12} md={6}>
                    <InputLabel variant="standard" htmlFor="uncontrolled-native">
                        Year
                    </InputLabel>
                    <Select style={{ width: "100%" }} value={yearSelectd} onChange={e => handleChange("YEAR", e)}>
                        {dataYear.map((year: string, yearIndex: number) => {
                            return (
                                <MenuItem value={year} key={yearIndex}>
                                    {year}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </Grid>

                {/* Select Type */}
                <Grid item xs={12} md={6}>
                    <InputLabel variant="standard" htmlFor="uncontrolled-native">
                        Type
                    </InputLabel>
                    <Select style={{ width: "100%" }} value={typeSelectd} onChange={e => handleChange("TYPE", e)}>
                        {dataType.map((type: DataType, typeIndex: number) => {
                            return (
                                <MenuItem value={type.value} key={typeIndex}>
                                    {type.title}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </Grid>

                {/* List Content */}
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {dataContent.map((content: { title: string; value: string }, contentIndex: number) => {
                            return (
                                <Chip
                                    key={contentIndex}
                                    color={content.value === contentSelected ? "primary" : undefined}
                                    label={content.title}
                                    onClick={() => handleChangeChip(content.value)}
                                />
                            );
                        })}
                    </Stack>
                </Grid>

                {/* Grid result */}
                {!!dataResult.length && (
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(dataResult[0])
                                            .filter(i => i !== "id")
                                            .map((keyResult: string, index) => (
                                                <TableCell key={index}>{keyResult}</TableCell>
                                            ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataResult.map((item, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        >
                                            {Object.keys(item)
                                                .filter(i => i !== "id")
                                                .map((key: string, index) => (
                                                    <TableCell key={index} component="th" scope="row">
                                                        {item[key]}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default RaceResult;
