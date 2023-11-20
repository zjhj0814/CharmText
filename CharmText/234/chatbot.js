 //창 전환 페이크 함수들
 function showNextPage(PageId){
    var currentVisible = document.querySelector('.visible');

    var nextPage=currentVisible.nextElementSibling;
    if(nextPage==PAGE3){
        var input1Value = document.getElementById("input1").value;
        var input2Value = document.getElementById("input2").value;
        var input3Value = document.getElementById("input3").value;
        var input4Value = document.getElementById("input4").value;

        //다른 알림 메시지로 수정!
        if (input1Value=="none"){ //notice, promotion과 같은 select의 value값을 가져올 수 있다.
            alert("푸시의 목적을 선택해주세요!");
            return;
        }
        
        if(!(input2Value&&input3Value&&input4Value)) {
            alert("필수 입력값을 모두 채워주세요!");
            return;
          }
    }

    //만약 다음 파일이 없다면 PAGE2로 돌아간다.
    if(!nextPage){
        nextPage = document.getElementById('PAGE2');
    }

    hideAllFiles();
    nextPage.classList.add('visible');
    activateCss(nextPage.id);
}

function hideAllFiles(){
    var pages = document.querySelectorAll('.visible');
    pages.forEach(function(page)    {
        page.classList.remove('visible');
        page.classList.add('hidden');
    });
}

function activateCss(pageId){
    var stylesheets = document.querySelectorAll('[id$="-style"]');
    stylesheets.forEach(function(stylesheet)    {
        stylesheet.disabled = true;
    });

    var currentStylesheet = document.getElementById(pageId + '-style');
    if(currentStylesheet){
        currentStylesheet.disabled = false;
    }
}

//홈으로
function navigateToPage1(){
    window.location.href = "../1/PAGE1.html";
}

//도움말 페이지로
function navigateToPage5(){
    window.location.href = "../5/PAGE5.html";
}

//클립보드에 복사하기
function copy(){
    var outputElement = document.getElementById('output');
    var textToCopy = outputElement.value;

    var tempTextArea = document.createElement('textarea');
    tempTextArea.value=textToCopy;
    document.body.appendChild(tempTextArea);

    tempTextArea.select();
    tempTextArea.setSelectionRange(0,99999);

    document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    alert('텍스트가 클립보드에 복사되었습니다.');
}

//출력창
const output_messages = document.querySelector('#output');
//푸시의 목적(공지/홍보)
const purposeInput = document.querySelector('#input1');
//푸시의 핵심
const coreInput = document.querySelector('#input2');
//푸시의 내용
const contentInput = document.querySelector('#input3');
//푸시의 발신처
const fromInput = document.querySelector('#input4');
//말투(친절하게, 무겁게, 간결하게)
const accentInput = document.querySelector('#input5');
//추가 요청사항
const requestInput = document.querySelector('#input6');

//전송버튼 PAGE3의 다음 페이지 말고 전송, 결과 보기 등의 메시지(id:getOutput)로 바꿀 예정
const sendButton = document.querySelector('#getOutput');

function addMessage(message){
    var outputTextarea = document.getElementById('output');
    outputTextarea.value += message;
}

//chatGPT API 요청
async function fetchAIResponse(message){
    const requestOptions = {
        method: 'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer git apiKey'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: message
        })
    };
    //API요청 후 응답처리
    try{
        const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        return aiResponse;
    }
    catch(error){
        console.error('OpenAi API 호출 중 오류 발생: ',error);
        return 'OpenAI API 호출 중 오류 발생';
    }
}

//전송 버튼 클릭 이벤트 처리
//Q.이 전송 이벤트뿐만 아니라 창 전환 함수도 onclick으로 설정해야 하는데 둘 다 될까??
sendButton.addEventListener('click',async()=>{
    const purposeSelect = purposeInput.value;
    switch(purposeSelect){
        case "notice":
            purposeInfor = "공지: 불필요한 강조를 지양해. 안내하고자 하는 내용을 명확하게 표현해."
            break;
        case "promotion":
            purposeInfor = "홍보: 흥미롭게 작성해. 사용자가 읽고 싶은 메세지를 작성해야 해."
            break;
        default:
            purposeInfor = "없음"
            break;
    }
    const coreInfor = coreInput.value.trim();
    const contentInfor = contentInput.value.trim();
    const fromInfor = fromInput.value.trim();
    
    const accentSelect = accentInput.value;
    switch(accentSelect){
        case "kindly": 
            accentInfor = "친절한 말투로 대답해. 쉽고 명확한 언어를 사용해서 대답해. 느낌표를 활용하고, 긍정적인 어휘를 써."
            break;
        case "heavy":
            accentInfor = "무거운 말투로 대답해. '-ㅂ니다체'를 사용하고, 신뢰성을 해칠 수 있는 유행어나 줄임말은 지양해. 진중한 표현을 써."
            break;
        case "briefly":
            accentInfor = "간결하게 대답해. 짧은 어구와 ':'기호를 사용해서 글을 써줘. 네 출력 길이가 매우 짧았으면 좋겠어."
            break;
        default:
            accentInfor = "말투 선택이 없을 경우, 내용을 기반으로 적절한 말투를 선택해. 선택된 말투에 따라 적절하게 표현 방식을 조정해."
            break;
    }
    const requestInfor = requestInput.value.trim();

    //fromInput.value='';으로 전송 버튼 클릭 시 초기화할 수 있다.
    const message = [
        {
          "role":"system",
          "content": `기본 행동 지침과 입력 별 지침이 주어질 테니 그에 따른 학교 푸시 메시지를 작성해 줘.
          아래는 기본 행동 지침이야.
            1. 내용의 가독성을 높이기 위해 적절한 분리 기호('-', ':')와 줄 바꿈을 적용해.
            2. 일관된 스타일과 명확한 표현을 사용해.
            3. 국립국어원의 외래어 표기법을 따라.
            4. 극존칭의 사용을 지양해.
            5. 수를 표현하고 싶다면 숫자를 사용해.
            6. 중복되는 내용을 절대 포함하지 마.
            7. 제목을 따로 작성해. 제목은 푸시의 내용을 함축적으로 담아야 해.
            8. 제목이 메세지의 문두에 나오게 해.
            9. 너가 왜 이렇게 작성했는지 설명하지 마.`
        },
        {
          "role":"user",
          "content": `아래는 입력 별 지침이야.
          1. 푸시의 목적:`+purposeInfor+`
          2. 푸시의 핵심:`+coreInfor+`
          - 사용자가 전달하고자 하는 핵심 내용이야.
          3. 푸시 내용:`+contentInfor+`
          - 입력으로 들어오는 내용을 이해하고, 핵심을 강조하여 결과값에 반영해.
          - 전체 메세지의 가독성을 높게 유지해.
          4. 발신처:`+fromInfor+
          `- 메시지가 어디서 왔는지, 발신처에 대한 정보야.
          5. 말투:`+accentInfor+`
          6. 추가적인 요청사항:`+requestInfor+`
          - 사용자가 제시한 추가 요청사항을 정확히 파악하고, 최종 결과값에 반영해.`
        }
      ];

    const aiResponse = await fetchAIResponse(message);
    addMessage(aiResponse);
    });
