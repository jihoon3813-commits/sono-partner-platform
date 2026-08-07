import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") || "크루즈";
        
        const apiUrl = 'https://www.sonoimready.com/service/sc/selectChgServList';
        const apiRes = await fetch(apiUrl, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.sonoimready.com/front/sc/chgServList',
                'Origin': 'https://www.sonoimready.com',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prdctCd: category,
                paging: {
                    pageNo: 1,
                    pageSize: 30
                }
            })
        });

        if (!apiRes.ok) {
            return NextResponse.json({ success: false, message: "Failed to fetch from external API" }, { status: 500 });
        }

        const resObj = await apiRes.json();
        if (!resObj.data || !resObj.data.chngPrdctVOList) {
            return NextResponse.json({ success: true, items: [] });
        }

        const list = resObj.data.chngPrdctVOList;
        const mappedItems = list.map((item: any) => {
            const formatDt = (str: string) => {
                if (!str || str.length !== 8) return str;
                return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6)}`;
            };

            const period = (item.regularPriceStDt || item.regularPriceEndDt)
                ? `${formatDt(item.regularPriceStDt)} ~ ${formatDt(item.regularPriceEndDt)}`
                : "상시접수";

            const formattedPrice = item.regularPrice
                ? `${Number(item.regularPrice).toLocaleString()}원~`
                : "가격 문의";

            const tags: string[] = [];
            if (item.categoryTxt2 === "Y") tags.push("전환");
            if (item.categoryTxt3 === "Y") tags.push("레디캐시");
            if (item.deadlinePrdctYn === "Y") tags.push("마감임박");
            if (tags.length === 0) tags.push("추천");

            let fileUrl = "";
            if (item.thumbnailImgFile && item.thumbnailImgFile.phyPath && item.thumbnailImgFile.saveFileNm) {
                const pathPartIdx = item.thumbnailImgFile.phyPath.indexOf("/attach");
                if (pathPartIdx !== -1) {
                    const relativePath = item.thumbnailImgFile.phyPath.slice(pathPartIdx);
                    fileUrl = `${relativePath}/${item.thumbnailImgFile.saveFileNm}`;
                }
            }

            const imgUrl = fileUrl
                ? `https://www.sonoimready.com/service/file/fileView?fileUrl=${fileUrl}`
                : "";

            return {
                name: item.prdctServNm || item.prdctNm || "전환 상품",
                desc: item.prdctCntn || "",
                price: formattedPrice,
                period: period,
                tags: tags,
                img: imgUrl,
                status: item.prcsNm || "접수중"
            };
        });

        return NextResponse.json({ success: true, items: mappedItems });
    } catch (error: any) {
        console.error("Hybrid products fetch API error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
