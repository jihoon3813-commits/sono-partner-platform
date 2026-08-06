import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const resolvedParams = await params;
        const category = decodeURIComponent(resolvedParams.category); // '크루즈' 또는 '여행'
        
        const apiUr = 'https://www.sonoimready.com/service/sc/selectChgServList';
        const apiRes = await fetch(apiUr, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prdctCd: category,
                paging: {
                    pageNo: 1,
                    pageSize: 12
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
            // 날짜 포맷팅: YYYYMMDD -> YYYY-MM-DD
            const formatDt = (str: string) => {
                if (!str || str.length !== 8) return str;
                return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6)}`;
            };

            const period = (item.regularPriceStDt || item.regularPriceEndDt)
                ? `${formatDt(item.regularPriceStDt)} ~ ${formatDt(item.regularPriceEndDt)}`
                : "상시접수";

            // 금액 포맷팅 (e.g. 7190000 -> 7,190,000원~)
            const formattedPrice = item.regularPrice
                ? `${Number(item.regularPrice).toLocaleString()}원~`
                : "가격 문의";

            // 태그 배열 구성
            const tags: string[] = [];
            if (item.categoryTxt2 === "Y") tags.push("전환");
            if (item.categoryTxt3 === "Y") tags.push("레디캐시");
            if (item.deadlinePrdctYn === "Y") tags.push("마감임박");
            if (tags.length === 0) tags.push("추천");

            // 이미지 URL 실시간 물리경로/파일명 조합
            let fileUrl = "";
            if (item.thumbnailImgFile && item.thumbnailImgFile.phyPath && item.thumbnailImgFile.saveFileNm) {
                const pathPartIdx = item.thumbnailImgFile.phyPath.indexOf("/attach");
                if (pathPartIdx !== -1) {
                    const relativePath = item.thumbnailImgFile.phyPath.slice(pathPartIdx);
                    fileUrl = `${relativePath}/${item.thumbnailImgFile.saveFileNm}`;
                }
            }

            const imgUrl = fileUrl
                ? `/api/hybrid/image-proxy?fileUrl=${encodeURIComponent(fileUrl)}`
                : "https://www.sonoimready.com/assets/images/common/img_default_product.svg";

            return {
                name: item.prdctServNm || "전환 상품",
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
