/********************************************
 Chart component
 src: src/page/race-results/Chart.tsx
 ********************************************/

import React, { useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Plane, Text } from "@react-three/drei";
import * as d3 from "d3";
import { Typography } from "@mui/material";

import { DataContent } from "../../types";
import dataCrawl from "../../data/index.json";

const result = dataCrawl as any;

interface boxProp {
    depth: number;
    width: number;
    height: number;
    x: number;
    y: number;
    z: number;
    data: any;
    index: number;
}

interface AppPropsObj {
    content?: string;
    value: string;
    type: string;
}

export interface AppProp {
    data: AppPropsObj;
}

const MyRotatingBox: React.FC<boxProp> = props => {
    const { data, x, y, z } = props;
    const myMesh = useRef(null);
    const [active, setActive] = useState(false);

    return (
        <mesh
            onPointerEnter={() => setActive(true)}
            onPointerLeave={() => setActive(false)}
            ref={myMesh}
            scale={1}
            position={[x, y, z]}
        >
            {/* text year */}
            <Text scale={2} position={[0, -props.height / 2 - 0.2, z]} color={"red"}>
                {data.year}
            </Text>
            {/* text Pos */}
            <Text scale={2} position={[0, props.height / 2 + 0.2, z]} color={"black"}>
                {data.Pos}
            </Text>

            {/* bar column */}
            <boxBufferGeometry args={[props.width, props.height, props.depth]} />
            <meshPhongMaterial color={active ? "yellow" : "green"} />
        </mesh>
    );
};

const App: React.FC<AppProp> = props => {

    const {data: {value, type, content}} = props;
    // dùng data crawl để tìm data của dữ liệu đã chọn trong các năm
    let dataFind: DataContent[] = [];

    // for theo năm
    Object.keys(result).forEach(year => {
        const dataT = JSON.parse(JSON.stringify(result[year][type])) || [];
        // tìm theo typeSelected
        const findItem = dataT.find((contentChild: DataContent) => contentChild.value === content);

        if (findItem) {
            findItem.result = findItem.result
                .filter((i: any) => i.id === value) // chỉ những data có id bằng giá trị truyền vào
                .flatMap((i: any) => ({ ...i, year: year, Pos: i.Pos || i["Race Position"] })); // Thêm field year dùng để render Chart
            dataFind.push(findItem);
        }
    });

    // map dữ liệu result của từng data trong danh sách tìm được thành mảng mới
    const data: any[] = dataFind.flatMap((i: DataContent) => i.result || []).slice(0,3); // chỉ lấy 3 giá trị đầu tránh tràn UI

    const maxVal = useMemo(() => Math.max(...data.map(o => o.Pos)), [data]);
    const scaleValue = useMemo(() => d3.scaleLinear().domain([0, maxVal]).range([1, 3]), [maxVal]);
    const scaleValueMargin = useMemo(
        // anchor is on center in three.js
        () =>
            d3
                .scaleLinear()
                .domain([maxVal, 0])
                .range([2 / 2, 0]),
        [maxVal]
    );

    const scaleX = useMemo(
        () => d3.scaleBand<number>().domain(d3.range(data.length)).range([-0.5, 1]).paddingInner(0.4),
        [data]
    );

    return (
        <div className="App">

            <Typography>RACE RESULT</Typography>
            <Typography>{type} is {value}</Typography>
            <Canvas style={{ minHeight: "600px" }}>
                <>
                    <OrbitControls />
                    <ambientLight intensity={0.1} />
                    <directionalLight color="red" position={[0, 0, 5]} />

                    {/* render danh sách <bar column> từ data */}
                    {data.slice(0, 3).map((d: any, index) => {
                        return (
                            <MyRotatingBox
                                key={index}
                                depth={0.1}
                                data={d}
                                index={index}
                                width={scaleX.bandwidth()}
                                height={scaleValue(d?.Pos)}
                                x={scaleX(index) || 0}
                                y={scaleValueMargin(d?.Pos)}
                                z={0}
                            />
                        );
                    })}

                    {/* bóng đổ */}
                    <mesh position={[0, -0.5, 0]}>
                        <Plane args={[3, 1]} rotation={[Math.PI / 2, 0, 0]}>
                            <meshBasicMaterial attach="material" color="#000" side={THREE.DoubleSide} />
                        </Plane>
                    </mesh>
                </>
            </Canvas>
        </div>
    );
};

export default App;
