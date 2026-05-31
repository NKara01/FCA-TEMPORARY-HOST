// States
// NOTES
// MODULE ID GETS SET LATER THIS IS INITIALISED HERE 
// Part ID and Q ID counters are natively gotten.
// Pending is because of the layers i set
// the 1 - 2 - 3 create steps 
// YEs, This was stolen!
let moduleId = null;
let pendingCoverImage = null;
let partCount= 0;
let partIdCounter= 0;
let qIdCounter = 0;

// Helpers
function showMsg(type, msg) {
    const s = document.getElementById('status-success');
    const e = document.getElementById('status-error');
    s.style.display = 'none';
    e.style.display = 'none';
    if (type === 'success') { s.textContent = msg; s.style.display = 'block'; }
    if (type === 'error')   { e.textContent = msg; e.style.display = 'block'; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePartCount() {
    document.getElementById('part-count-num').textContent = partCount;
    document.getElementById('btn-add-part').disabled = partCount >= 20;
}

// steps boilerplate from stack and w3 course for web dev hence the i n

function setStep(n) {
    [1,2,3].forEach(i => {
        document.getElementById('step-' + i).style.display = i === n ? 'block' : 'none';
        const ind = document.getElementById('step-ind-' + i);
        ind.className = 'step' + (i < n ? ' done' : i === n ? ' active' : '');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Create module ------------------------------------------------------------------
async function submitModule() {
    const title = document.getElementById('mod-title').value.trim();
    const description = document.getElementById('mod-desc').value.trim();
    const price_cents = parseInt(document.getElementById('mod-price').value) || 0;
    const image_url = document.getElementById('mod-image');

    pendingModule = {
        title: title,
        description: description,
        price_cents: price_cents,
        image_url: image_url.files[0],
    };
    showMsg('success', 'Module details saved locally. Now add parts below.');
    setStep(2);
}

// add parts
function addPart() {
    if (partCount >= 20) return;
    partCount++;
    partIdCounter++;
    updatePartCount();

    const pid = partIdCounter;
    const pNum = partCount;
    const container = document.getElementById('parts-container');

    const div = document.createElement('div');
    div.className = 'part-card';
    div.id = `part-ui-${pid}`;
    div.dataset.partNumber = pNum;
    div.innerHTML = `
        <div class="part-card-header">
            <span class="part-label">Part ${pNum}</span>
            <button class="part-remove" onclick="removePart(${pid})" title="Remove part">✕</button>
        </div>

        <div class="form-group cm-form-group-small">
            <label>Part title *</label>
            <input type="text" id="part-title-${pid}" placeholder="e.g. Introduction to Microbiology">
        </div>

        <div class="form-group cm-form-group-small">
            <label>PDF (optional)</label>
            <div class="pdf-upload-area" onclick="document.getElementById('pdf-file-${pid}').click()">
                <input type="file" id="pdf-file-${pid}" accept=".pdf"
                       onchange="showPdfName(${pid}, this)">
                <div class="pdf-label">Click to upload PDF</div>
                <div class="pdf-chosen" id="pdf-chosen-${pid}"></div>
            </div>
        </div>

        <div class="form-group cm-form-group-small">
            <label>Youtube URL (optional)</label>
            <input type="text" id="part-youtube-${pid}" placeholder="Insert your video here">
        </div>

        <div class="form-group cm-form-group-small">
            <label>Body Text (optional)</label>
            <input type="text" id="part-body-${pid}" placeholder="Insert information here">
        </div>

        <div class="toggle-row">
            <input type="checkbox" id="has-quiz-${pid}" onchange="toggleBlock('part-quiz-${pid}', this.checked)">
            <label for="has-quiz-${pid}">Add a quiz after this part</label>
        </div>

        <div id="part-quiz-${pid}" class="cm-quiz-block cm-hidden">
            <div class="form-group cm-form-group-tiny">
                <label>Quiz title</label>
                <input type="text" id="quiz-title-${pid}" placeholder="e.g. Part ${pNum} Check">
            </div>
            <div class="pass-row cm-form-group-small">
                <label>Pass mark</label>
                <input type="number" id="quiz-pass-${pid}" value="80" min="0" max="100">
                <span class="cm-muted-text">%</span>
            </div>
            <div id="questions-${pid}"></div>
            <button class="btn-ghost cm-question-add-btn"
                    onclick="addQuestion('part', ${pid})">+ Add question</button>
        </div>
    `;
    container.appendChild(div);
}

function removePart(pid) {
    const el = document.getElementById(`part-ui-${pid}`);
    if (el) { el.remove(); partCount--; updatePartCount(); }
    // re-label remaining parts
    const cards = document.querySelectorAll('.part-card');
    cards.forEach((c, i) => {
        c.dataset.partNumber = i + 1;
        c.querySelector('.part-label').textContent = `Part ${i + 1}`;
    });
}

function showPdfName(pid, input) {
    const label = document.getElementById(`pdf-chosen-${pid}`);
    label.textContent = input.files[0] ? input.files[0].name : '';
}

function toggleBlock(id, checked) {
    document.getElementById(id).style.display = checked ? 'block' : 'none';
}

// ── Questions ────────────────────────────────────────────────────────────────
function addQuestion(context, partUiId) {
    qIdCounter++;
    const qid = qIdCounter;
    const containerId = context === 'final'
        ? 'final-exam-questions'
        : `questions-${partUiId}`;
    const container = document.getElementById(containerId);

    const div = document.createElement('div');
    div.className = 'question-block';
    div.id = `q-ui-${qid}`;
    div.innerHTML = `
        <div class="question-block-header">
            <span class="question-label">Question</span>
            <button class="q-remove" onclick="removeQuestion(${qid})">✕</button>
        </div>

        <div class="form-group cm-form-group-tiny">
                <label>Upload Question Image (optional)</label>
                <div class="image_container">
                    <!-- https://stackoverflow.com/questions/4459379/preview-an-image-before-it-is-uploaded -->
                    <input multiple accept="image/*" type="file" id="qimage-${qid}" name="mod-image" />  
                </div>
            </div>

        <div class="form-group cm-form-group-tiny">
            <input type="text" id="qtext-${qid}" placeholder="Enter question text">
        </div>

        <div class="form-group cm-form-group-tiny">
            <select id="qtype-${qid}" class="cm-question-select" onchange="changeQType(${qid}, this.value)">
                <option value="multiple_choice">Multiple choice</option>
                <option value="true_false">True / False</option>
            </select>
        </div>

        <div id="answers-${qid}">
            ${buildAnswerRow(qid, 0)}
            ${buildAnswerRow(qid, 1)}
            ${buildAnswerRow(qid, 2)}
            ${buildAnswerRow(qid, 3)}
        </div>
        <button class="btn-ghost cm-answer-add-btn"
                onclick="addAnswerRow(${qid})" id="btn-add-ans-${qid}">+ Add option</button>
    `;
    container.appendChild(div);
}

function buildAnswerRow(qid, idx) {
    return `
        <div class="answer-row" id="ans-row-${qid}-${idx}">
            <input type="radio" name="correct-${qid}" value="${idx}">
            <input type="text" placeholder="Option ${idx + 1}">
            <span class="answer-correct-label">correct</span>
        </div>`;
}

function addAnswerRow(qid) {
    const container = document.getElementById(`answers-${qid}`);
    const idx = container.children.length;
    container.insertAdjacentHTML('beforeend', buildAnswerRow(qid, idx));
}

function changeQType(qid, type) {
    const container = document.getElementById(`answers-${qid}`);
    const addBtn = document.getElementById(`btn-add-ans-${qid}`);
    if (type === 'true_false') {
        container.innerHTML = buildAnswerRow(qid, 0).replace('Option 1', 'True') + buildAnswerRow(qid, 1).replace('Option 2', 'False');
        addBtn.style.display = 'none'; } 
    else {
        container.innerHTML = buildAnswerRow(qid, 0) + buildAnswerRow(qid, 1) + buildAnswerRow(qid, 2) + buildAnswerRow(qid, 3);
        addBtn.style.display = '';}}

function removeQuestion(qid) {
    const el = document.getElementById(`q-ui-${qid}`);
    if (el) el.remove();}
// Read from container js

function readQuestions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const blocks = container.querySelectorAll('.question-block');
    const out = [];
    blocks.forEach((block, i) => {
        const qid = block.id.replace('q-ui-', '');
        const text = (document.getElementById(`qtext-${qid}`)?.value || '').trim();
        const image1 = document.getElementById(`qimage-${qid}`);
        let image = image1.files[0]
        const type = document.getElementById(`qtype-${qid}`)?.value || 'multiple_choice';
        const rows = document.getElementById(`answers-${qid}`)?.querySelectorAll('.answer-row') || [];
        const answers = [];
        rows.forEach(row => {
            const radio = row.querySelector('input[type="radio"]');
            const input = row.querySelector('input[type="text"]');
            const aText= (input?.value || '').trim();
            if (aText) {
                answers.push({ text: aText, is_correct: radio?.checked || false });
            }
        });
        if (text && answers.length) {
            out.push({ question_text: text, question_type: type, order_num: i, answers, question_image : image });
        }
    });
    return out;
}

// SUBIMT PATS
async function submitAll() {
    if (!pendingModule) {
        showMsg('error', 'Module details are not saved yet.');
        return;
    }

    const partCards = document.querySelectorAll('.part-card');
    if (partCards.length < 2) {
        showMsg('error', 'Please add at least 2 parts.');
        return;
    }

    //  pendingModule = {
    //     title: title,
    //     description: description,
    //     price_cents: price_cents,
    //     image_url: image_url.files[0],
    // };
    const fdf = new FormData();
    fdf.append('title', pendingModule.title);
    fdf.append('description', pendingModule.description);
    fdf.append('price_cents', pendingModule.price_cents);
    fdf.append('image_url', pendingModule.image_url);
    try {
        const moduleRes = await fetch('/api/admin/modules', {
            
            method:'POST', body: fdf
 });

        const moduleData = await moduleRes.json();

        if (!moduleRes.ok) {
            showMsg('error', moduleData.error || 'Failed to create module.');
            return;
    }

        moduleId = moduleData.module_id;
        // --- save each part ---
        for (let i = 0; i < partCards.length; i++) {
            const card= partCards[i];
            const pid = card.id.replace('part-ui-', '');
            const pNum = parseInt(card.dataset.partNumber);
            const title = (document.getElementById(`part-title-${pid}`)?.value || '').trim();
            const hasQuiz = document.getElementById(`has-quiz-${pid}`)?.checked ? '1' : '0';
            const fileEl = document.getElementById(`pdf-file-${pid}`);
            const youtube_url = (document.getElementById(`part-youtube-${pid}`)?.value || '').trim();
            const body = (document.getElementById(`part-body-${pid}`)?.value || '').trim();

        if (!title) { showMsg('error', `Part ${pNum} needs a title.`); return; }
            console.log(youtube_url)
            console.log(body)
            const fd = new FormData();
            fd.append('title', title);
            fd.append('part_number', pNum);
            fd.append('has_quiz', hasQuiz);
            fd.append('youtube_url', youtube_url);
            fd.append('body', body);
            if (fileEl?.files[0]) fd.append('pdf_file', fileEl.files[0]);

            const res= await fetch(`/api/admin/modules/${moduleId}/parts`, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) { showMsg('error', `Part ${pNum}: ${data.error}`); return; }

            const partId = data.part_id;

            // --- save part quiz if toggled ---
        if (hasQuiz === '1' ) {
            if (partId == null) {
                if (!qRes.ok) { showMsg('error', `Part is null`); return; }
            }
            const quizTitle = (document.getElementById(`quiz-title-${pid}`)?.value || '').trim()
                                || `Part ${pNum} Quiz`;
            const passPct   = parseInt(document.getElementById(`quiz-pass-${pid}`)?.value) || 80;
            const questions = readQuestions(`questions-${pid}`);

            const qRes  = await fetch('/api/admin/quizzes', {
                method:'POST',
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({ module_id: moduleId, part_id: partId, title: quizTitle, is_final_exam: 0, pass_percent: passPct })});
            const qData = await qRes.json();
            if (!qRes.ok) { showMsg('error', `Quiz for part ${pNum}: ${qData.error}`); return; }

                const quizId = qData.quiz_id;
                for (const q of questions) {
                    const fd = new FormData();
                    // { question_text: text, question_type: type, order_num: i, answers, question_image : image }
                    fd.append('question_text',q.question_text);
                    fd.append('question_type',q.question_type);
                    fd.append('order_num',q.order_num);
                    //fd.append('answers',JSON.stringify(q.answers));
                    //console.log(q.answers)
                    fd.append('question_image',q.question_image);
                    const qres = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
                        method:'POST',
                        body:fd
                    });
                    const qData = await qres.json();
                    if (!qres.ok) { showMsg('error', `question: ${qData.error}`); return; }
                    //  answers.push({ text: aText, is_correct: radio?.checked || false });
                    const question_id = qData.question_id;
                    for (const z of q.answers){
                        const fzzd = new FormData();
                        fzzd.append('answer_text', z.text);
                        fzzd.append('is_correct', z.is_correct);
                        const aares = await fetch(`/api/admin/quizzes/${quizId}/questions/${question_id}`, {
                                method:'POST',
                                body:fzzd
                                
                        });
                        const aaData = await aares.json();
                        if (!aares.ok) { showMsg('error', `answer: ${aaData.error}`); return; }
                    }
                
                }}}

        // --- save final exam if toggled ---
        const hasFinal = document.getElementById('has-final-exam')?.checked;
        if (hasFinal) {
            const examTitle = (document.getElementById('final-exam-title')?.value || '').trim()|| 'Final Exam';
            const passPct= parseInt(document.getElementById('final-exam-pass')?.value) || 80;
            const questions = readQuestions('final-exam-questions');

            const eRes= await fetch('/api/admin/quizzes', {
                method:'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module_id: moduleId, title: examTitle, is_final_exam: 1, pass_percent: passPct })});
            const eData = await eRes.json();
            if (!eRes.ok) { showMsg('error', `Final exam: ${eData.error}`); return; }

            const examId = eData.quiz_id;
            for (const q of questions) {
                const fd = new FormData();
                // { question_text: text, question_type: type, order_num: i, answers, question_image : image }
                fd.append('question_text',q.question_text);
                fd.append('question_type',q.question_type);
                fd.append('order_num',q.order_num);
                // fd.append('answers',JSON.stringify(q.answers));
                //  console.log(q.answers)
                fd.append('question_image',q.question_image);
                const qres = await fetch(`/api/admin/quizzes/${examId}/questions`, {
                        method:'POST',
                        body:fd
                });
                const qData = await qres.json();
                if (!qres.ok) { showMsg('error', `question: ${qData.error}`); return; }
                //  answers.push({ text: aText, is_correct: radio?.checked || false });
                const question_id = qData.question_id;
                for (const z of q.answers){
                    const fzzd = new FormData();
                    fzzd.append('answer_text', z.text);
                    fzzd.append('is_correct', z.is_correct);
                    console.log(z)
                     const aares = await fetch(`/api/admin/quizzes/${examId}/questions/${question_id}`, {
                            method:'POST',
                            body:fzzd
                            
                    });
                    const aaData = await aares.json();
                    if (!aares.ok) { showMsg('error', `answer: ${aaData.error}`); return; }
                }
            }
            }

        setStep(3);

    } catch (err) {
        showMsg('error', 'Network error. Please try again.');
    }}
