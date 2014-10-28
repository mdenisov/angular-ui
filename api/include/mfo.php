<?php


$app->get('/mfo/', 'getMfos');
$app->get('/mfo/page/:page', 'getMfos');
$app->get('/mfo/:id', 'getMfo');
$app->put('/mfo/:id', 'updateMfo');
$app->post('/mfo/', 'addMfo');
$app->delete('/mfo/:id', 'deleteMfo');

function getMfo($id) {
    $sql = "SELECT * FROM mfo WHERE id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $user = $stmt->fetchObject();
        $db = null;
        echo json_encode($user);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateMfo($id) {
    $request = \Slim\Slim::getInstance()->request();
    $body = $request->getBody();
    $mfo = json_decode($body);
    $sql = "UPDATE mfo SET additional_information=:additional_information, address=:address, certificate=:certificate, chief_name=:chief_name, chief_position=:chief_position, code=:code, comments=:comments, detail_text=:detail_text, is_active=:is_active, name=:name, name_full=:name_full, name_genitive=:name_genitive, name_prepositional=:name_prepositional, order_pos=:order_pos, preview_text=:preview_text, region_id=:region_id, trademark_mfo=:trademark_mfo, url=:url WHERE id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->bindParam("additional_information", $mfo->additional_information);
        $stmt->bindParam("address", $mfo->address);
        $stmt->bindParam("certificate", $mfo->certificate);
        $stmt->bindParam("chief_name", $mfo->chief_name);
        $stmt->bindParam("chief_position", $mfo->chief_position);
        $stmt->bindParam("code", $mfo->code);
        $stmt->bindParam("comments", $mfo->comments);
        $stmt->bindParam("detail_text", $mfo->detail_text);
        $stmt->bindParam("is_active", $mfo->is_active);
        $stmt->bindParam("name", $mfo->name);
        $stmt->bindParam("name_full", $mfo->name_full);
        $stmt->bindParam("name_genitive", $mfo->name_genitive);
        $stmt->bindParam("name_prepositional", $mfo->name_prepositional);
        $stmt->bindParam("order_pos", $mfo->order_pos);
        $stmt->bindParam("preview_text", $mfo->preview_text);
        $stmt->bindParam("region_id", $mfo->region_id);
        $stmt->bindParam("trademark_mfo", $mfo->trademark_mfo);
        $stmt->bindParam("url", $mfo->url);
        $stmt->execute();
        $db = null;
        echo json_encode($mfo);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteMfo($id) {
    $sql = "DELETE FROM mfo WHERE id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addMfo() {
    $request = \Slim\Slim::getInstance()->request();
    $mfo = json_decode($request->getBody());
    $sql = "INSERT INTO mfo (additional_information, address, certificate, chief_name, chief_position, code, comments, detail_text, is_active, name, name_full, name_genitive, name_prepositional, order_pos, preview_text, region_id, trademark_mfo, url, created) VALUES (:additional_information, :address, :certificate, :chief_name, :chief_position, :code, :comments, :detail_text, :is_active, :name, :name_full, :name_genitive, :name_prepositional, :order_pos, :preview_text, :region_id, :trademark_mfo, :url, now())";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("additional_information", $mfo->additional_information);
        $stmt->bindParam("address", $mfo->address);
        $stmt->bindParam("certificate", $mfo->certificate);
        $stmt->bindParam("chief_name", $mfo->chief_name);
        $stmt->bindParam("chief_position", $mfo->chief_position);
        $stmt->bindParam("code", $mfo->code);
        $stmt->bindParam("comments", $mfo->comments);
        $stmt->bindParam("detail_text", $mfo->detail_text);
        $stmt->bindParam("is_active", $mfo->is_active);
        $stmt->bindParam("name", $mfo->name);
        $stmt->bindParam("name_full", $mfo->name_full);
        $stmt->bindParam("name_genitive", $mfo->name_genitive);
        $stmt->bindParam("name_prepositional", $mfo->name_prepositional);
        $stmt->bindParam("order_pos", $mfo->order_pos);
        $stmt->bindParam("preview_text", $mfo->preview_text);
        $stmt->bindParam("region_id", $mfo->region_id);
        $stmt->bindParam("trademark_mfo", $mfo->trademark_mfo);
        $stmt->bindParam("url", $mfo->url);
        $stmt->execute();
        $mfo->id = $db->lastInsertId();
        $db = null;
        echo json_encode($mfo);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getMfos($page = 1) {
    $sql = "select * FROM mfo ORDER BY id";
    try {
        $db = getConnection();
        $stmt = $db->query($sql);
        $users = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($users);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

?>